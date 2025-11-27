<script setup lang="ts">
import { ref } from "vue";
import { useConfig } from "@/hooks/useConfig";
import SvgIcon from "@/components/SvgIcon.vue";

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
    <el-form :model="form" label-position="right" label-width="auto">
      <el-form-item label="支持Method过滤">
        <template v-slot:label>
          <span>支持Method过滤</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="关闭后导出不会区分method文件夹"
            placement="top"
          >
            <svg-icon
              name="tooltip"
              width="16"
              height="16"
              class="relative top-[8px] left-[2px]"
            />
          </el-tooltip>
        </template>
        <el-switch v-model="form.method_enable" />
      </el-form-item>
      <el-form-item label="支持Host过滤">
        <template v-slot:label>
          <span>支持Host过滤</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="关闭后只导出当前host资源"
            placement="top"
          >
            <svg-icon
              name="tooltip"
              width="16"
              height="16"
              class="relative top-[8px] left-[2px]"
            />
          </el-tooltip>
        </template>
        <el-switch v-model="form.host_enable" />
      </el-form-item>
      <el-form-item label="导出加载日志">
        <el-switch v-model="form.log_enable" />
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
