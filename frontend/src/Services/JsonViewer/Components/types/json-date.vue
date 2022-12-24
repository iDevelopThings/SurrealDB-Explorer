<script lang="ts">
import {h, defineComponent} from "vue";
export default defineComponent(({
  name: 'JsonDate',
  inject: ['timeformat'],
  functional: true,
  props: {
    jsonValue: {
      type: Date,
      required: true
    }
  },
  render () {
    const value = this.jsonValue;
    const timeformat = this.timeformat;

    return h('span', {
      class: {
        'jv-item': true,
        'jv-string': true,
      },
      innerText: `"${timeformat(value)}"`
    })
  }
}))
</script>
