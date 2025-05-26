import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Derived_Timeseries_Definition,
  Emetric_TimeSeries,
  Emetric_TimeSeriesEntry
} from "../../shared/types.js";
import { getExistingEntries } from "../../shared/emetric/utils.js";

// Collection name for derived time series definitions
const DERIVED_TIMESERIES_DEFINITIONS_COLLECTION = "emetric_derived_timeseries_definitions";

/**
 * Main function to calculate all derived metrics
 * @param db - Firestore database instance
 */
export const calculateDerivedMetrics = async (db: Firestore): Promise<void> => {
  try {
    logger.info("Starting derived metrics calculation");
    
    // 1. Read all derived time series definitions
    const definitions = await getAllDerivedTimeSeriesDefinitions(db);
    logger.info(`Found ${definitions.length} derived time series definitions`);
    
    if (definitions.length === 0) {
      logger.info("No derived time series definitions found, skipping calculation");
      return;
    }
    
    // 2. Parse formulas and build dependency graph
    const dependencyGraph = buildDependencyGraph(definitions);
    
    // 3. Perform topological sort to determine calculation order
    const sortedMetricIds = topologicalSort(dependencyGraph);
    logger.info(`Calculation order: ${sortedMetricIds.join(', ')}`);
    
    // 4. Calculate each derived metric in the correct order
    for (const metricId of sortedMetricIds) {
      const definition = definitions.find(def => def.id === metricId);
      if (definition) {
        await calculateDerivedMetric(db, definition, dependencyGraph);
      }
    }
    
    logger.info("Derived metrics calculation completed successfully");
  } catch (error) {
    logger.error("Error calculating derived metrics:", error);
    throw error;
  }
};

/**
 * Fetches all derived time series definitions from Firestore
 * @param db - Firestore database instance
 * @returns Array of derived time series definitions
 */
async function getAllDerivedTimeSeriesDefinitions(
  db: Firestore
): Promise<Emetric_Derived_Timeseries_Definition[]> {
  try {
    const snapshot = await db.collection(DERIVED_TIMESERIES_DEFINITIONS_COLLECTION).get();
    return snapshot.docs.map(doc => doc.data() as Emetric_Derived_Timeseries_Definition);
  } catch (error) {
    logger.error("Error fetching derived time series definitions:", error);
    throw error;
  }
}

/**
 * Represents a dependency graph where keys are metric IDs and values are arrays of dependent metric IDs
 */
interface DependencyGraph {
  [metricId: string]: {
    dependencies: string[];
    definition: Emetric_Derived_Timeseries_Definition;
  };
}

/**
 * Builds a dependency graph from derived time series definitions
 * @param definitions - Array of derived time series definitions
 * @returns Dependency graph
 */
function buildDependencyGraph(
  definitions: Emetric_Derived_Timeseries_Definition[]
): DependencyGraph {
  const graph: DependencyGraph = {};
  
  for (const definition of definitions) {
    const dependencies = extractDependencies(definition.formula);
    graph[definition.id] = {
      dependencies,
      definition
    };
  }
  
  return graph;
}

/**
 * Extracts metric dependencies from a formula
 * @param formula - Formula string
 * @returns Array of metric IDs that the formula depends on
 */
function extractDependencies(formula: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const dependencies: string[] = [];
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    dependencies.push(match[1]);
  }
  
  // Remove duplicates
  return [...new Set(dependencies)];
}

/**
 * Performs topological sort on the dependency graph to determine calculation order
 * @param graph - Dependency graph
 * @returns Array of metric IDs in calculation order
 */
function topologicalSort(graph: DependencyGraph): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];
  
  function visit(node: string) {
    // If we've already processed this node, skip it
    if (visited.has(node)) return;
    
    // If we're currently processing this node, we have a cycle
    if (temp.has(node)) {
      throw new Error(`Circular dependency detected involving metric: ${node}`);
    }
    
    // Mark node as being processed
    temp.add(node);
    
    // Process all dependencies first
    const dependencies = graph[node]?.dependencies || [];
    for (const dependency of dependencies) {
      // Only visit if it's a derived metric (in our graph)
      if (graph[dependency]) {
        visit(dependency);
      }
    }
    
    // Mark node as processed
    temp.delete(node);
    visited.add(node);
    result.push(node);
  }
  
  // Visit all nodes
  for (const node in graph) {
    if (!visited.has(node)) {
      visit(node);
    }
  }
  
  return result;
}

/**
 * Calculates a single derived metric based on its formula and dependencies
 * @param db - Firestore database instance
 * @param definition - Derived time series definition
 * @param graph - Dependency graph
 */
async function calculateDerivedMetric(
  db: Firestore,
  definition: Emetric_Derived_Timeseries_Definition,
  graph: DependencyGraph
): Promise<void> {
  try {
    logger.info(`Calculating derived metric: ${definition.id}`);
    
    // 1. Get all dependent time series data
    const dependencies = graph[definition.id].dependencies;
    const dependentData: Record<string, Emetric_TimeSeriesEntry[]> = {};
    
    for (const depId of dependencies) {
      const entries = await getExistingEntries(db, depId);
      if (entries.length === 0) {
        logger.warn(`No data found for dependency ${depId} of metric ${definition.id}`);
        return; // Skip calculation if any dependency has no data
      }
      dependentData[depId] = entries;
    }
    
    // 2. Determine all unique timestamps across all dependencies
    const allTimestamps = getAllUniqueTimestamps(dependentData);
    logger.info(`Found ${allTimestamps.length} unique timestamps for metric ${definition.id}`);
    
    if (allTimestamps.length === 0) {
      logger.warn(`No timestamps found for metric ${definition.id}`);
      return;
    }
    
    // 3. Calculate values for each timestamp
    const calculatedEntries: Emetric_TimeSeriesEntry[] = [];
    
    for (const timestamp of allTimestamps) {
      try {
        const value = calculateValueForTimestamp(
          timestamp,
          definition.formula,
          dependentData,
          definition.alignmentStrategy
        );
        
        calculatedEntries.push({
          timestamp,
          value
        });
      } catch (error) {
        logger.error(`Error calculating value for timestamp ${timestamp}:`, error);
        // Continue with other timestamps
      }
    }
    
    // 4. Store the calculated entries
    if (calculatedEntries.length > 0) {
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(definition.id);
      await timeSeriesRef.set({
        id: definition.id,
        entries: calculatedEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully stored ${calculatedEntries.length} calculated entries for metric ${definition.id}`);
    } else {
      logger.warn(`No entries calculated for metric ${definition.id}`);
    }
  } catch (error) {
    logger.error(`Error calculating derived metric ${definition.id}:`, error);
    throw error;
  }
}

/**
 * Gets all unique timestamps from dependent data
 * @param dependentData - Record of dependent time series data
 * @returns Array of unique timestamps
 */
function getAllUniqueTimestamps(
  dependentData: Record<string, Emetric_TimeSeriesEntry[]>
): number[] {
  const timestamps = new Set<number>();
  
  for (const entries of Object.values(dependentData)) {
    for (const entry of entries) {
      timestamps.add(entry.timestamp);
    }
  }
  
  return Array.from(timestamps).sort((a, b) => a - b);
}

/**
 * Calculates the value for a specific timestamp based on the formula
 * @param timestamp - Timestamp to calculate for
 * @param formula - Formula string
 * @param dependentData - Record of dependent time series data
 * @param alignmentStrategy - Strategy for aligning timestamps
 * @returns Calculated value
 */
function calculateValueForTimestamp(
  timestamp: number,
  formula: string,
  dependentData: Record<string, Emetric_TimeSeriesEntry[]>,
  alignmentStrategy: 'previous' | 'future' | 'nearest' | 'interpolate'
): number {
  // Replace all metric references with their values
  let evaluableFormula = formula;
  
  for (const [metricId, entries] of Object.entries(dependentData)) {
    const value = getValueForTimestamp(timestamp, entries, alignmentStrategy);
    evaluableFormula = evaluableFormula.replace(
      new RegExp(`\\{\\{${metricId}\\}\\}`, 'g'),
      value.toString()
    );
  }
  
  // Evaluate the formula
  try {
    // Using Function constructor to evaluate the formula
    // This is safe in this context as the formula is from a trusted source (admin-created)
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${evaluableFormula})`)();
  } catch (error) {
    logger.error(`Error evaluating formula: ${evaluableFormula}`, error);
    throw new Error(`Failed to evaluate formula: ${evaluableFormula}`);
  }
}

/**
 * Gets the value for a specific timestamp from time series entries
 * @param timestamp - Timestamp to get value for
 * @param entries - Time series entries
 * @param alignmentStrategy - Strategy for aligning timestamps
 * @returns Value for the timestamp
 */
function getValueForTimestamp(
  timestamp: number,
  entries: Emetric_TimeSeriesEntry[],
  alignmentStrategy: 'previous' | 'future' | 'nearest' | 'interpolate'
): number {
  // Sort entries by timestamp
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  
  // Check for exact match
  const exactMatch = sortedEntries.find(entry => entry.timestamp === timestamp);
  if (exactMatch) {
    return exactMatch.value;
  }
  
  // Find previous and next entries
  const previousEntry = sortedEntries
    .filter(entry => entry.timestamp < timestamp)
    .pop();
  
  const nextEntry = sortedEntries
    .find(entry => entry.timestamp > timestamp);
  
  // Apply alignment strategy
  switch (alignmentStrategy) {
    case 'previous':
      if (previousEntry) {
        return previousEntry.value;
      }
      break;
      
    case 'future':
      if (nextEntry) {
        return nextEntry.value;
      }
      break;
      
    case 'nearest':
      if (previousEntry && nextEntry) {
        const prevDiff = timestamp - previousEntry.timestamp;
        const nextDiff = nextEntry.timestamp - timestamp;
        return prevDiff <= nextDiff ? previousEntry.value : nextEntry.value;
      } else if (previousEntry) {
        return previousEntry.value;
      } else if (nextEntry) {
        return nextEntry.value;
      }
      break;
      
    case 'interpolate':
      if (previousEntry && nextEntry) {
        const totalDiff = nextEntry.timestamp - previousEntry.timestamp;
        const currentDiff = timestamp - previousEntry.timestamp;
        const ratio = currentDiff / totalDiff;
        return previousEntry.value + ratio * (nextEntry.value - previousEntry.value);
      } else if (previousEntry) {
        return previousEntry.value;
      } else if (nextEntry) {
        return nextEntry.value;
      }
      break;
  }
  
  // If we can't determine a value, throw an error
  throw new Error(`Cannot determine value for timestamp ${timestamp} with strategy ${alignmentStrategy}`);
}
