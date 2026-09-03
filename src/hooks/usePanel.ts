import { reactive, ref, computed, markRaw } from "vue";
import { isFirefox, getZipName, downloadByHar, humanSize, getCategory, isVideoAudio } from "@/utils";
import type { TableColumnCtx } from "element-plus";
import { ElMessage } from "element-plus";
import { useConfig } from "./useConfig";

export function usePanel() {
  const { config } = useConfig();
  const enable = ref(true);
  const statistics = reactive({
    size: 0,
    total: 0,
    success: 0,
    failed: 0,
  });
  const loading = ref(false);
  const resources = ref<Resource[]>([]);
  const uriSet = new Set();
  const methods = ref<Set<string>>(new Set());
  const methodFilters = computed(() => {
    return Array.from(methods.value).map((item) => ({
      text: item,
      value: item,
    }));
  });
  const hosts = ref<Set<string>>(new Set());
  const hostFilters = computed(() => {
    return Array.from(hosts.value).map((item) => ({
      text: item,
      value: item,
    }));
  });
  const categories = ref<Set<string>>(new Set());
  const categoryFilters = computed(() => {
    return Array.from(categories.value).map((item) => ({
      text: item,
      value: item,
    }));
  });
  const inspectedWindowHost = ref<string>("");
  const selectedResources = ref<Resource[]>([]);
  const selectedSize = computed(() => {
    return humanSize(
      selectedResources.value.reduce((pre, cur) => pre + cur.size, 0),
    );
  });

  const largeFiles = ref<Resource[]>([]);
  const largeFilesVisible = ref(false);

  if (!import.meta.env.DEV) {
    chrome.devtools.network.onRequestFinished.addListener(onRequest);
    chrome.devtools.inspectedWindow.eval(
      "location.host",
      (result, isException) => {
        if (isException) {
          console.error("Error evaluating expression:", isException);
        } else {
          console.log("Host:", result);
          inspectedWindowHost.value = result as unknown as string;
        }
      },
    );
  }

  function onRequest(v: any) {
    if (!enable.value) return;
    statistics.total++;
    const { request, response } = v;
    const status = response.status;
    const content = response.content;
    const method = request.method;
    const url = request.url;
    const uri = method + "-" + url;
    if (uriSet.has(uri)) return;
    uriSet.add(uri);
    const size = content.size || response.bodySize || 0;
    if (size > 0) statistics.size += size;
    let mimeType = (content.mimeType || "").trim();
    if (isFirefox) mimeType = mimeType.split(";")[0].trim();
    const category = getCategory(mimeType);
    let path = "";
    let host = "";
    const pre = url.substring(0, 5);
    if (pre === "data:" || pre === "blob:") {
      path = url.substring(0, 19) + "...";
    } else {
      path = getZipName(url, mimeType);
      host = new URL(url).host;
    }
    if (
      !config.host_enable &&
      inspectedWindowHost.value &&
      host &&
      host !== inspectedWindowHost.value
    ) {
      return;
    }
    methods.value.add(method);
    hosts.value.add(host);
    categories.value.add(category);
    resources.value.push(
      markRaw({
        uri,
        value: v,
        method,
        host,
        path,
        mimeType,
        category,
        size,
        status,
      }),
    );
  }

  function clear() {
    resources.value = [];
    uriSet.clear();
    hosts.value.clear();
    categories.value.clear();
    Object.assign(statistics, {
      size: 0,
      total: 0,
      success: 0,
      failed: 0,
    });
  }

  function refresh() {
    clear();
    if (!import.meta.env.DEV) {
      chrome.devtools.inspectedWindow.reload();
    }
  }

  function splitResources() {
    const thresholdBytes = config.large_file_threshold * 1024 * 1024;
    const zipResources: Resource[] = [];
    const directResources: Resource[] = [];
    for (const r of selectedResources.value) {
      if (isVideoAudio(r.mimeType) && r.size > thresholdBytes) {
        directResources.push(r);
      } else {
        zipResources.push(r);
      }
    }
    return { zipResources, directResources };
  }

  async function download() {
    const { zipResources, directResources } = splitResources();
    if (directResources.length > 0) {
      largeFiles.value = directResources;
      largeFilesVisible.value = true;
      return;
    }
    loading.value = true;
    await downloadByHar(zipResources, config).catch((_) => null);
    loading.value = false;
  }

  async function confirmLargeDownload() {
    largeFilesVisible.value = false;
    const { zipResources, directResources } = splitResources();
    loading.value = true;
    if (zipResources.length > 0) {
      await downloadByHar(zipResources, config).catch((_) => null);
    }
    if (!import.meta.env.DEV) {
      for (const r of directResources) {
        chrome.downloads.download({ url: r.value.request.url });
      }
    }
    loading.value = false;
    const msg = zipResources.length > 0
      ? `小文件已打包下载，${directResources.length} 个大文件通过直链下载`
      : `${directResources.length} 个大文件通过直链下载`;
    ElMessage.success(msg);
  }

  function cancelLargeDownload() {
    largeFiles.value = [];
    largeFilesVisible.value = false;
  }

  function filterHandler(
    value: string,
    row: Resource,
    column: TableColumnCtx<Resource>,
  ) {
    const property = column["property"] as keyof Resource;
    return row[property] === value;
  }

  function selectionChangeHandler(val: Resource[]) {
    selectedResources.value = val;
  }

  return {
    config,
    loading,
    enable,
    statistics,
    resources,
    selectedResources,
    selectedSize,
    methodFilters,
    hostFilters,
    categoryFilters,
    largeFiles,
    largeFilesVisible,
    clear,
    refresh,
    download,
    confirmLargeDownload,
    cancelLargeDownload,
    filterHandler,
    selectionChangeHandler,
  };
}
