import ClapButton from "@/components/ClapButton";
import { delay } from "@/lib/utils";
import { BlogPost, BlogPostsResponse } from "@/models/BlogPost";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface BlogPostPageProps {
  params: { postId: string };
}

//As we calling two fetch requests in this page which means this is not good practice but nextjs has deduping mechanism to avoid multiple fetch calls for same resources
//it only do dediplicate for fetch calls with same arguments


// const getpost = cache(async (postId: string): Promise<BlogPost> =>{
//   const post = await prisma.post.findUnique(postId);
//   return post; 
// })

export async function generateStaticParams(){
  const response = await fetch('https://dummyjson.com/posts');
  const { posts }: BlogPostsResponse = await response.json();

  return posts.map(({id}) => id)
}

export async function generateMetadata({
  params: { postId },
}: BlogPostPageProps):Promise<Metadata> {
  //const post = await getpost(postId);
  //if we don't want to use fetch and also want deduping then we can use cache from react to cache the result of the function

  const response = await fetch(`https://dummyjson.com/posts/${postId}`);
  const post: BlogPost = await response.json();
  return {
    title: post.title,
    description: post.body,// First 160 characters as description,
    openGraph:{
      images:[
        {
          url: `https://dummyimage.com/1200x630/000/fff&text=${encodeURIComponent(post.title)}`,
        }
      ]
    }
  }
}

export default async function BlogPostPage({
  params: { postId },
}: BlogPostPageProps) {
  const response = await fetch(`https://dummyjson.com/posts/${postId}`);
  const { title, body }: BlogPost = await response.json();

  if(response.status === 404){
    notFound();
  }

  await delay(1000);

  return (
    <article className="max-w-prose m-auto space-y-5">
      <h1 className="text-3xl text-center font-bold">{title}</h1>
      <p className="text-lg">{body}</p>
      <ClapButton></ClapButton>
    </article>
  );
}
