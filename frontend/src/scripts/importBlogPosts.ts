import axios from 'axios';
import matter from 'gray-matter';
import FirebaseApi from '../firebase/FirebaseApi.js';
import { BlogPost } from '../../../shared/types.js';

const GITHUB_REPO = 'ephiepark/ephiepark.github.io';
const POSTS_PATH = '_posts';

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get the list of files in the _posts directory
    const response = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}`
    );

    const posts = await Promise.all(
      response.data.map(async (file: { name: string; download_url: string }) => {
        // Fetch the content of each markdown file
        const contentResponse = await axios.get(file.download_url);
        const { data: frontMatter, content } = matter(contentResponse.data);

        // Parse the filename to get the date (assuming format: YYYY-MM-DD-title.md)
        const dateStr = file.name.split('-').slice(0, 3).join('-');
        const createdAt = new Date(dateStr).getTime();

        return {
          id: file.name.replace('.md', ''),
          title: frontMatter.title || 'Untitled',
          createdAt,
          content
        } as BlogPost;
      })
    );

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
}

async function importPosts() {
  try {
    const posts = await fetchBlogPosts();
    const firebase = FirebaseApi.getInstance();
    await firebase.importBlogPosts(posts);
    console.log(`Successfully imported ${posts.length} blog posts`);
  } catch (error) {
    console.error('Error importing blog posts:', error);
  }
}

// Execute the import
importPosts();
