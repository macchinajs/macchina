<script context="module">
  import { browser, dev } from '$app/env';
  import { get } from '$lib/req_utils.js'
  import dayjs from "dayjs";
  import RelativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(RelativeTime);

  export const prerender = true

  export async function load({ params, fetch, session, context }) {
    const slug = params.slug
    const username = slug.split('/')[0]
    const titleSlug = slug.split('/')[1]

    const url = `/post/findone?author=${username}&slug=${titleSlug}`
    const res = await get(url)

    console.log("RES2:", res)

    if (res) {
      return {
        props: {
          loadedpost: res
        }
      };
    }
  }
</script>

<script>
  export let loadedpost
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-start justify-center">
    <div class="pt-2">
      <span class="font-bold text-lg">{loadedpost.title}
      </span>
      <span class="text-md">by
      </span>
      <span class="text-md font-semibold">{loadedpost.author}
      </span>
    </div>
    <div class="flex flex-col items-center justify-center">
      {loadedpost.body}
    </div>
  </div>
</div>


<style style lang="postcss">
</style>
