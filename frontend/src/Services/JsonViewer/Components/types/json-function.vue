<script lang="ts">
import {h, defineComponent} from "vue";
export default defineComponent(({
  name: 'JsonFunction',
  functional: true,
  props: {
    jsonValue: {
      type: Function,
      required: true
    }
  },
  render () {
    return h('span', {
      class: {
        'jv-item': true,
        'jv-function': true,
      },
      attrs: {
        title: this.jsonValue.toString()
      },
      innerHTML: '&lt;function&gt;'
    })
  }
}))
</script>
