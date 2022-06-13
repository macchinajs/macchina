<script>
  import { User, modal } from '../../store/store'
  import { goto } from "$app/navigation"
  import Hamburger from './hamburger.svelte'
  import AuthModal from '$lib/auth/auth_modal.svelte'

  function login() {
    modal.set(true)
  }
</script>

<header class="flex flex-col items-center pt-2">
  <div class="w-full max-w-screen-lg flex-row items-center justify-center border-black border-t-2 py-3">
    <div class="flex flex-row justify-between">
      <a sveltekit:prefetch href="/">
        <button class="text-lg lowercase">macchinajs</button>
      </a>
      <div class="flex flex-row">
        <a sveltekit:prefetch href="/" class="px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/')}>posts</a>
        {#if $User.email != ''}
        <a sveltekit:prefetch href="/post" class="px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/post')}>write</a>
        <a sveltekit:prefetch href="/profile" class="px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/profile')}>profile</a>
        {/if}
        <a sveltekit:prefetch href="/about" class="px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/about')}>about</a>
      </div>
      {#if $User.email != ''}
      <button on:click={() => {User.reset(); goto('/')}}
              class="button transition duration-300 ease-in-out hover:text-yellow-500"
        >logout
      </button>
      {:else}
      <button on:click={() => login()}
              class="button transition duration-300 ease-in-out hover:text-yellow-500"
        >login
      </button>
      {/if}
    </div>
  </div>
</header>
{#if $modal}
  <AuthModal/>
{/if}

<style>
</style>
