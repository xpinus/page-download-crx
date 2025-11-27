import { reactive } from "vue";

export type ConfigParams = {
  method_enable: boolean;
  host_enable: boolean;
  log_enable: boolean;
};

const config = reactive<ConfigParams>({
  method_enable: true, // 是否显示请求方法列
  host_enable: true, // 是否显示Host列
  log_enable: true, // 是否下载加载日志
});

async function loadConfig() {
  if (import.meta.env.DEV) return;

  let storageConfig = {};
  try {
    const keys = Object.keys(config);
    storageConfig = await chrome.storage.sync.get(keys);
  } catch (err) {
    console.error(err);
  }
  Object.assign(config, storageConfig);
  console.log("storageConfig", storageConfig, config);
}
loadConfig();

function updateConfig(obj: ConfigParams) {
  Object.assign(config, obj);

  if (import.meta.env.DEV) return;
  chrome.storage.sync.set(config);
}

export function useConfig() {
  return { config, updateConfig };
}
