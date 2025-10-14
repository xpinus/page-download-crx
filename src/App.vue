<script setup lang="ts">
import {} from "vue";
import { usePanel } from "./hooks/usePanel";
import { humanSize } from "./utils";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const {
  loading,
  enable,
  statistics,
  resources,
  selectedResources,
  selectedSize,
  methodFilters,
  hostFilters,
  clear,
  refresh,
  download,
  filterHandler,
  selectionChangeHandler,
} = usePanel();
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div v-loading="loading" element-loading-text="正在获取资源压缩文件...">
      <div
        class="top flex items-center justify-between border-b border-b-gray-300 px-4 py-1"
      >
        <div class="flex gap-4">
          <div class="toolbar flex gap-4 border-r-2 border-r-gray-400 pr-4">
            <div
              class="hover:text-primary flex cursor-pointer items-center [&_svg]:h-4 [&_svg]:w-4"
              :class="{
                'text-primary': enable,
              }"
              :title="enable ? '暂停' : '开始'"
              @click="enable = !enable"
            >
              <svg-icon name="load"></svg-icon>
            </div>
            <div
              class="hover:text-primary flex cursor-pointer items-center [&_svg]:h-4 [&_svg]:w-4"
              title="清除"
              @click="clear"
            >
              <svg-icon name="clear"></svg-icon>
            </div>
            <!-- <div
            class="hover:text-primary flex cursor-pointer items-center [&_svg]:h-4 [&_svg]:w-4"
            title="设置"
          >
            <svg-icon name="setting"></svg-icon>
          </div> -->
          </div>

          <ul class="statistics flex items-center gap-4 text-sm text-zinc-600">
            <li>
              <label>总大小: </label>
              <span>{{ humanSize(statistics.size) }}</span>
            </li>
            <li>
              <label>总请求: </label>
              <span>{{ resources.length }}</span>
            </li>
            <li>
              <label>选中: </label>
              <span>{{ selectedResources.length }}</span>
            </li>
            <li>
              <label>选中大小: </label>
              <span>{{ selectedSize }}</span>
            </li>
          </ul>
        </div>

        <el-button
          style="padding: 4px 8px"
          :disabled="selectedResources.length === 0"
          type="primary"
          @click="download"
        >
          <svg-icon name="download" class="mr-1 h-4 w-4 text-white"></svg-icon>
          下载</el-button
        >
      </div>
      <div class="content">
        <div
          v-if="resources.length === 0"
          class="bg-primary m-auto mt-20 flex w-fit cursor-pointer items-center gap-1 rounded px-2 py-1 text-base whitespace-nowrap text-white select-none hover:opacity-80 [&_svg]:h-5 [&_svg]:w-5"
          @click="refresh"
        >
          <svg-icon name="play"></svg-icon>
          开始加载
        </div>
        <div v-else class="list">
          <el-table
            :data="resources"
            row-key="uri"
            style="width: 100%"
            @selection-change="selectionChangeHandler"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              prop="method"
              label="方法"
              align="center"
              width="100"
              :filters="methodFilters"
              :filter-method="filterHandler"
            />
            <el-table-column
              prop="host"
              label="主机域名"
              align="center"
              min-width="180"
              :filters="hostFilters"
              :filter-method="filterHandler"
            >
              <template #default="{ row }">
                <div class="text-left">{{ row.host }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="path"
              label="路径"
              align="center"
              min-width="300"
            >
              <template #default="{ row }">
                <div class="text-left">{{ row.path }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="mimeType"
              label="类型"
              align="center"
              width="180"
            />
            <el-table-column prop="size" label="大小" align="center" width="80">
              <template #default="{ row }">
                <div>{{ humanSize(row.size) }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              align="center"
              width="80"
            />
          </el-table>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>
