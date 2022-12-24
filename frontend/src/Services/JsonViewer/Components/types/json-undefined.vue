<script lang="ts">
import {h, defineComponent} from "vue";
export default defineComponent(({
  name: 'JsonUndefined',
  functional: true,
  props: {
    jsonValue: {
      type: Object,
      default: null
    }
  },
  render () {
    return h('span', {
      class: {
        'jv-item': true,
        'jv-undefined': true,
      },
      innerText: this.jsonValue === null ? 'null' : 'undefined'
    })
  }
}))
</script>
