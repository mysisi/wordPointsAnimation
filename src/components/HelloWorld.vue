<template>
  <div ref="points" class="full">
  </div>
</template>

<script>
import Points from '../lib/Points.js'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted () {
    let p = new Points(this.$refs.points, [
      'falcon',
      'vislab'
    ])
  }
}
</script>
<style>

</style>
