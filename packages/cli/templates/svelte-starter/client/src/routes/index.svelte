<script context="module">
  import { browser, dev } from '$app/env';
  import { get } from '$lib/req_utils.js'
  import dayjs from "dayjs";
  import RelativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(RelativeTime);

  export const prerender = true

  export async function load({ url, fetch }) {
    const res = await get('/post/find')

    return {
      props: {
        posts: res
      }
    };
  }
</script>

<script>
  import { User } from '../store/store'
  export let posts
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-start justify-start">
    <div class="pt-6 text-xl border-b-2 border-gray-600">Posts</div>

    <div class="flex flex-col items-center justify-center">
      {#each posts as post}
      <div class="flex flex-col items-start justify-start pt-4 border-b-2  border-gray-600 pb-2">
        <div class="font-semibold text-md">
          <a sveltekit:prefetch href="/posts/{post.author}/{post.slug}">
            {post.title}
            <img class="h-36 rounded-lg" src="https://fpaboim-macchina.s3.amazonaws.com/{post.image}" alt="">
          </a>
        </div>
        <div class="text-sm pt-2">
          by {post.author} {dayjs(post.created).fromNow()}
        </div>
      </div>
      {/each}
    </div>
  </div>
</div>


<style style lang="postcss">
</style>
