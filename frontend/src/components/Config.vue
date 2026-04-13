<script setup>
import { storeToRefs } from 'pinia'

import { usePreferenceStore } from '@/stores/preference.js'
import { useUiStore } from '@/stores/ui.js'

import ConfigField from '@/components/ConfigField.vue'

const preferenceStore = usePreferenceStore()
const uiStore = useUiStore()

const { matrixConfig } = storeToRefs(preferenceStore)
const { loadingRatings } = storeToRefs(uiStore)
</script>

<template>
  <Fieldset legend="settings">
    <div class="form">
      <div class="row">
        <label for="treat_dnf_as_ranked" class="mr-1">Treat DNF as a rating</label>

        <ConfigField @reset="preferenceStore.resetSetting('treatDnfAsRanked')">
          <ToggleSwitch id="treat_dnf_as_ranked" v-model="matrixConfig.treatDnfAsRanked" />
        </ConfigField>
      </div>
      <div class="row">
        <label for="dnf_ranking" class="mr-1">DNF rating equivalent</label>
        <ConfigField
          :disabled="!matrixConfig.treatDnfAsRanked"
          v-model="matrixConfig.dnfRanking"
          :step="0.25"
          @reset="preferenceStore.resetSetting('dnfRanking')"
        />
      </div>
      <div class="row">
        <label for="no_ranking" class="mr-1">No rating value</label>
        <ConfigField
          v-model="matrixConfig.noRankingWeight"
          id="no_ranking"
          :step="0.25"
          @reset="preferenceStore.resetSetting('noRankingWeight')"
        />
      </div>

      <div class="row">
        <label for="pos_range" class="mr-1">Matched rating tolerance</label>
        <ConfigField
          id="pos_range"
          :min="0"
          :max="10"
          :step="0.5"
          v-model.number="matrixConfig.posRange"
          @reset="preferenceStore.resetSetting('posRange')"
        />
      </div>

      <div class="row">
        <label for="pos_range" class="mr-1">Mismatched rating tolerance</label>
        <ConfigField
          id="neg_range"
          :min="0"
          :max="10"
          :step="0.5"
          v-model.number="matrixConfig.negRange"
          @reset="preferenceStore.resetSetting('negRange')"
        />
      </div>

      <div class="row">
        <label for="pos_modifier" class="mr-1">Matched positive rating modifier</label>
        <ConfigField
          id="pos_modifier"
          :step="0.5"
          v-model.number="matrixConfig.posModifier"
          @reset="preferenceStore.resetSetting('posModifier')"
        />
      </div>

      <div class="row">
        <label for="matching_neg_modifier" class="mr-1">Matched negative rating modifier</label>
        <ConfigField
          id="matching_neg_modifier"
          :step="0.5"
          v-model.number="matrixConfig.matchingNegModifier"
          @reset="preferenceStore.resetSetting('matchingNegModifier')"
        />
      </div>

      <div class="row">
        <label for="neg_modifier" class="mr-1">Mismatched rating modifier</label>
        <ConfigField
          id="neg_modifier"
          :step="0.5"
          v-model.number="matrixConfig.negModifier"
          @reset="preferenceStore.resetSetting('negModifier')"
        />
      </div>

      <div class="row">
        <label for="pos_bonus" class="mr-1">Bonus to positive values</label>
        <ConfigField
          id="pos_bonus"
          :step="0.1"
          v-model.number="matrixConfig.posBonus"
          @reset="preferenceStore.resetSetting('posBonus')"
        />
      </div>

      <div class="row">
        <label for="neg_penalty" class="mr-1">Bonus to negative values</label>
        <ConfigField
          id="neg_penalty"
          :step="0.25"
          v-model.number="matrixConfig.negPenalty"
          @reset="preferenceStore.resetSetting('negPenalty')"
        />
      </div>

      <div class="row">
        <label
          v-tooltip.top="'Greatly increases number of required queries and time'"
          for="include_unrated"
          class="mr-1"
          :disabled="loadingRatings"
          ><em>Experimental</em>: include unrated reads</label
        >
        <ConfigField @reset="preferenceStore.resetSetting('includeUnrated')">
          <ToggleSwitch
            id="include_unrated"
            v-model="matrixConfig.includeUnrated"
            :disabled="loadingRatings"
          />
        </ConfigField>
      </div>
    </div>
  </Fieldset>
</template>

<style scoped>
dl {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
label {
  flex: 1;
}
:deep(.p-inputnumber) {
  margin-bottom: 1rem;
  margin-right: 1rem;
}
.form {
  font-size: 0.875rem;
}
</style>
