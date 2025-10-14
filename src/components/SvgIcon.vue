<script setup lang="ts">
import { computed, defineComponent } from "vue";

defineComponent({
	name: "SvgIcon",
});

const props = withDefaults(defineProps<{
	prefix?: string;
	name: string;
} > (), {
    prefix: "icon",
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>

<template>
	<svg aria-hidden="true" v-bind="$attrs">
		<use :xlink:href="symbolId"  />
	</svg>
</template>
