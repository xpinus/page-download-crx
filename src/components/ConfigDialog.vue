<script setup lang="ts">
import { ref } from "vue";
import { useConfig } from "@/hooks/useConfig";

const dialogVisible = ref(false);
const { config, updateConfig } = useConfig();

const form = ref();

function open() {
  form.value = JSON.parse(JSON.stringify(config));
  dialogVisible.value = true;
}

function submit() {
  updateConfig(form.value);
  dialogVisible.value = false;
}

defineExpose({
  open: open,
  close: () => {
    dialogVisible.value = false;
  },
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="设置"
    width="500"
    body-class="px-12 py-4"
  >
    <el-form :model="form">
      <el-form-item label="使用Method">
        <el-switch v-model="form.method_enable" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped></style>
