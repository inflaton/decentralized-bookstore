<script setup lang="ts">
import { ref, toRefs } from 'vue'

const emit = defineEmits(['update:selected'])
const props = defineProps<{
  options: number[] | string[] | object[] | undefined[]
  selected: number | string | object | undefined
  filterFn?: (...args: any[]) => any
}>()

const { options, selected } = toRefs(props)

const dropdown = ref(false)
const dropdownHandler = () => {
  dropdown.value = !dropdown.value
}

const select = (option: number | string | object | undefined) => {
  emit('update:selected', option)
}
</script>

<template>
  <div>
    <div>
      <button
        @click="dropdownHandler"
        v-click-outside="() => (dropdown = false)"
        type="button"        
      >
        {{ filterFn ? filterFn(selected) : selected }}       
      </button>
    </div>

    <div
      v-if="dropdown"      
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
    >
      <div class="py-1" role="none">
        <div
          v-for="(option, i) in options"
          :key="i"
          @click="select(option)"
          href="#"
          role="menuitem"
          tabindex="-1"
          id="menu-item-0"
        >
          {{ filterFn ? filterFn(option) : option }}
        </div>
      </div>
    </div>
  </div>
</template>
