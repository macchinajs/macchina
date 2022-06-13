<script>
  import Header from "$lib/header/index.svelte";
  import Footer from "$lib/footer/index.svelte";
  import Toast from "$lib/toast.svelte";
  import "../app.css";

  let sidebarOpen = false;
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css?family=Gelasio"
    rel="stylesheet"
  />
</svelte:head>

<main class="h-screen p-6 bg-amber-50 flex flex-col">
  <Header />
  <div class="flex flex-col items-center">
    <div class="w-full max-w-screen-lg">
      <slot />
    </div>
    <toast />
  </div>
</main>

<style>
</style>
