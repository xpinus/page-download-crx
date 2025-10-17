import { reactive, ref, computed, markRaw } from "vue";
import { isFirefox, getZipName, downloadByHar, humanSize } from "@/utils";
import type { TableColumnCtx } from "element-plus";
import { useConfig } from "./useConfig";

export function usePanel() {
  const { config } = useConfig();
  const enable = ref(true); // 是否开始资源获取
  const statistics = reactive({
    size: 0,
    total: 0,
    success: 0,
    failed: 0,
  });
  const loading = ref(false);
  const resources = ref<Resource[]>([]); // 列表数据
  const uriSet = new Set(); // 排重地址
  const methods = ref<Set<string>>(new Set()); // 包含的请求方法
  const methodFilters = computed(() => {
    return Array.from(methods.value).map((item) => ({
      text: item,
      value: item,
    }));
  });
  const hosts = ref<Set<string>>(new Set()); //  包含的主机域名
  const hostFilters = computed(() => {
    return Array.from(hosts.value).map((item) => ({
      text: item,
      value: item,
    }));
  });
  const selectedResources = ref<Resource[]>([]);
  const selectedSize = computed(() => {
    return humanSize(
      selectedResources.value.reduce((pre, cur) => pre + cur.size, 0),
    );
  });

  if (!import.meta.env.DEV) {
    chrome.devtools.network.onRequestFinished.addListener(onRequest); // 网络请求完成
  }

  // 网络请求完成
  function onRequest(v: any) {
    if (!enable.value) return; // 停止资源获取

    statistics.total++;
    const { request, response } = v;
    const status = response.status;
    const content = response.content;

    // 请求地址
    const method = request.method;
    const url = request.url;
    const uri = method + "-" + url;

    // 请求地址去重
    if (uriSet.has(uri)) {
      // TODO 重复记录...
      return;
    }
    uriSet.add(uri); // 记录请求地址

    // 记录资源大小
    const size = content.size || response.bodySize || 0;
    if (size > 0) statistics.size += size;

    // 文件类型
    let mimeType = (content.mimeType || "").trim();
    if (isFirefox) mimeType = mimeType.split(";")[0].trim();

    let path = "";
    let host = "";
    const pre = url.substring(0, 5);
    if (pre === "data:" || pre === "blob:") {
      // 排除 data and blob URLs
      path = url.substring(0, 19) + "...";
    } else {
      path = getZipName(url, mimeType); // 生成 zip 路径
      host = new URL(url).host;
    }

    methods.value.add(method);
    hosts.value.add(host);

    resources.value.push(
      markRaw({
        uri,
        value: v,
        method,
        host,
        path,
        mimeType,
        size,
        status,
      }),
    );
  }

  function clear() {
    resources.value = [];
    uriSet.clear();
    hosts.value.clear();
    Object.assign(statistics, {
      size: 0,
      total: 0,
      success: 0,
      failed: 0,
    });
  }

  // 重新加载
  function refresh() {
    clear();
    if (!import.meta.env.DEV) {
      chrome.devtools.inspectedWindow.reload();
    }
  }

  // 下载已加载的资源
  async function download() {
    loading.value = true;
    await downloadByHar(selectedResources.value, config).catch((_) => null);
    loading.value = false;
  }

  // 表格筛选
  function filterHandler(
    value: string,
    row: Resource,
    column: TableColumnCtx<Resource>,
  ) {
    const property = column["property"] as keyof Resource;
    return row[property] === value;
  }

  // 表格选中
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
    clear,
    refresh,
    download,
    filterHandler,
    selectionChangeHandler,
  };
}
