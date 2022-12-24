<script lang="ts">
import {h, defineComponent} from "vue";
export default defineComponent({
  name: 'JsonBoolean',
  functional: true,
  props: {
    jsonValue: Boolean
  },
  render () {
    return h('span', {
      class: {
        'jv-item': true,
        'jv-boolean': true,
      },
      innerText: this.jsonValue.toString()
    })
  }
})
</script>
