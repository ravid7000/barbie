<script lang="ts">
  let className = ''
  export { className as class }
  export let id = ''
</script>

<section {id} class="px-6{className ? ` ${className}` : ''}">
  <slot />
</section>
