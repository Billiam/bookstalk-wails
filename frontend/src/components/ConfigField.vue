<script setup>
const model = defineModel()
const props = defineProps({
  step: {
    default: 0.25,
  },
  min: {},
  max: {},
  disabled: {},
  id: {},
})
const emit = defineEmits(['reset'])
</script>

<template>
  <div class="field-wrapper">
    <slot>
      <InputNumber
        v-model="model"
        showButtons
        buttonLayout="horizontal"
        :id="props.id"
        :step="props.step"
        :min="props.min"
        :max="props.max"
        :disabled="props.disabled"
        size="small"
        fluid
      >
        <template #incrementbuttonicon>
          <span class="pi pi-plus" />
        </template>
        <template #decrementbuttonicon>
          <span class="pi pi-minus" />
        </template>
      </InputNumber>
    </slot>
  </div>
  <Button aria-label="reset" @click="emit('reset')" icon="pi pi-undo" size="small" />
</template>

<style scoped>
:deep(.p-inputnumber) {
  margin-bottom: 0 !important;
}
.field-wrapper {
  width: 10rem;
  margin-right: 1rem;
}
</style>
