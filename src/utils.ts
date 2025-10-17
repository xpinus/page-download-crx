import JSZip from "jszip";
import type { ConfigParams } from "@/hooks/useConfig";

export const isFirefox = navigator.userAgent.includes("Firefox");

// 获取资源内容
export function getContent(request: any): any {
  return new Promise((resolve, reject) => {
    try {
      request.getContent((content: any, encoding: any) =>
        resolve({ content, encoding }),
      );
    } catch (err) {
      reject(err);
    }
  });
}

// 根据 URL 和文件类型生成 zip 路径
export function getZipName(
  url: string,
  mimeType: string,
  method?: string,
  isFull?: any,
) {
  try {
    const u = new URL(url);
    let host = filterHan(u.host) || "-";
    const zipName = getDir(u.pathname) + getFixFilename(u.pathname, mimeType);
    if (isFull) {
      let protocol = ["http:", "https:"].includes(u.protocol)
        ? ""
        : u.protocol.replace(/[^\w\-]/, "");
      if (method) method = method + "-";
      if (protocol) protocol = protocol + "/";
      if (host) host = host + "/";
      return method + protocol + host + zipName;
    }
    return (host || "") + "/" + zipName;
  } catch (e) {
    console.warn(e);
  }

  return "";
}

// 过滤字符串，防止压缩打包失败
// 参考：
// https://zhuanlan.zhihu.com/p/33335629
// https://keqingrong.github.io/blog/2020-01-29-regexp-unicode-property-escapes
// http://www.unicode.org/Public/10.0.0/ucd/PropList.txt Unified_Ideograph
function filterHan(s: string) {
  // console.log(/\p{Script=Han}/u.test('我是中国人，我爱中国'))
  // console.log(/^\p{Script=Han}+$/u.test('我是中国人，我爱中国'))
  // console.log(/\p{Unified_Ideograph}/u.test('我是中国人，我爱中国'))
  let r = "";
  if (s.includes("%")) s = decodeURIComponent(s); // 链接解码
  for (const v of s) {
    if (/[\w.@\-]/.test(v) || /\p{Unified_Ideograph}/u.test(v)) {
      r += v;
    } else {
      r += "_";
    }
  }
  r = r.replace(/_{2,}/g, "_");
  return r;
}

// 获取目录
function getDir(s: string) {
  const n = s.lastIndexOf("/");
  if (n === -1 || !s) return "";
  s = s.substring(0, n); // 获取文件夹
  const arr = s.split("/");
  const r = [];
  for (let i = arr.length - 1; i > -1; i--) {
    let name = filterHan(arr[i]!.trim());
    if (!name || name === ".") continue; // 排除空目录
    if (name === "..") {
      r.pop(); // 退回一级目录
      continue;
    }
    if (name.length > 64) name = s.substring(0, 64); // 限制目录名长度
    r.push(name);
  }
  if (r.length < 1) return "";
  r.reverse(); // 倒序回来
  return r.join("/") + "/";
}

// 修正最常见的类型即可，避免画蛇添足
function getFixFilename(s: string, contentType: string) {
  s = getFilename(s) || "index";
  const ext = getExt(s);
  if (ext.length > 0) {
    return s; // 有后缀就不做处理
  } else if (
    contentType.includes("text/html") ||
    contentType.includes("document")
  ) {
    return s + ".html";
  } else if (
    contentType.includes("text/css") ||
    contentType.includes("stylesheet")
  ) {
    return s + ".css";
  } else if (contentType.includes("json")) {
    return s + ".json";
  } else if (
    contentType.includes("javascript") ||
    contentType.includes("sm-script")
  ) {
    return s + ".js";
  } else if (contentType.indexOf("text/") === 0) {
    return s + ".txt";
  } else if (contentType.includes("image")) {
    if (contentType.includes("image/png")) return s + ".png";
    if (contentType.includes("image/jpeg")) return s + ".jpg";
    if (contentType.includes("image/gif")) return s + ".gif";
    if (contentType.includes("image/bmp")) return s + ".bmp";
    if (contentType.includes("image/x-icon")) return s + ".ico";
    return s + ".jpg"; // 不是常见类型，随便补一个后缀
  } else {
    return s;
  }
}

// 获取文件名
function getFilename(s: string) {
  if (!s) return "";

  // 过滤非法链接
  let n = s.indexOf(";");
  if (n > -1) {
    s = s.substring(0, n);
    if (!s) return "";
  }

  // 获取文件名
  n = s.lastIndexOf("/");
  if (n > -1) s = s.substring(n + 1);

  // 限制最大长度
  s = filterHan(s);
  const maxLen = 64;
  if (s.length > maxLen) {
    const ext = getExt(s);
    if (ext) {
      const name = s.substring(0, maxLen - ext.length - 1);
      s = name + "." + ext; // 缩短后的文件名
    } else {
      s = s.substring(0, maxLen);
    }
  }
  return s;
}

// 获取后缀
function getExt(s: string) {
  const n = s.lastIndexOf(".");
  if (n === -1) return ""; // 没有后缀
  let ext = s.substring(n + 1);
  ext = ext.replace(/[^0-9a-zA-Z]/g, ""); // 限制只能是数字和字母
  if (ext.length > 16) ext = ext.substring(0, 16); // 限制最大长度
  return ext.toLocaleLowerCase();
}

// 获取所有资源
export function getResources() {
  // return new Promise((resolve, reject) => {
  //   if (isFirefox) {
  //     reject("Firefox 未实现此接口");
  //     // see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.inspectedWindow
  //     // devtools.inspectedWindow.getResources().then(resources => resolve(resources)).catch(err => reject(err))
  //   } else {
  //     devtools.inspectedWindow.getResources((resources) => resolve(resources));
  //   }
  // });
}

// 通过 har 日志打包下载数据
export async function downloadByHar(
  resources: Resource[],
  config: ConfigParams,
) {
  let log = ""; // 正常日志
  let logEmpty = ""; // 空内容的文件日志

  // 遍历请求，获取资源并打包
  const zipPaths: any = {}; // 记录 zip 包路径，允许重名
  const zip = new JSZip();
  for (const resource of resources) {
    const { value: v } = resource;
    const method = v.request.method;
    const url = v.request.url;
    const status = v.response.status;
    const size = v.response.content.size || v.response.bodySize || 0;
    let mimeType = v.response.content.mimeType;
    if (isFirefox) mimeType = mimeType.split(";")[0].trim();
    // 排除 data 和 bold 类型 (由程序生成的数据)
    const pre = url.substring(0, 5);
    if (pre === "data:" || pre === "blob:") {
      log += `[excluded]\t${url}\n`; // 被排除的文件日志
      continue;
    }

    const { content, encoding: _encoding } = await getContent(v);
    if (!content) {
      logEmpty += `${status}\t${method}\t${humanSize(size)}\t${url}\n`; // 空内容的文件日志
      continue;
    }
    let zipFile = getZipName(
      url,
      mimeType,
      config.method_enable ? method : "",
      true,
    ); // 生成 zip 路径
    if (!zipPaths[zipFile]) zipPaths[zipFile] = 1;
    else {
      zipPaths[zipFile]++;
      zipFile = renameZipName(zipFile, zipPaths[zipFile]); // 重名情况，重命名
    }
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.network/onRequestFinished
    let encoding = _encoding;
    if (isFirefox) encoding = v.response.content.encoding;
    if (encoding) {
      zip.file(zipFile, content, { base64: encoding === "base64" }); // 目前浏览器只支持 base64 编码
      log += `[${encoding}]\t${status}\t${method}\t${size}\t${url}\t${zipFile}\n`;
    } else {
      zip.file(zipFile, content);
      log += `${status}\t${method}\t${size}\t${url}\t${zipFile}\n`;
    }
  }

  zip.file("log.txt", log); // 日志

  // 生成 zip 包，并下载文件
  await zip
    .generateAsync({ type: "blob" })
    .then(function (blob) {
      downloadZip(blob);
    })
    .catch((err) => console.warn("zip generateAsync error:", err));
}

// 人类易读文件大小
export function humanSize(n: number) {
  if (n < 1024) {
    return n + " B";
  } else if (n < 1024 * 1024) {
    return (n / 1024).toFixed(2) + " K";
  } else if (n < 1024 * 1024 * 1024) {
    return (n / 1024 / 1024).toFixed(2) + " M";
  } else if (n < 1024 * 1024 * 1024 * 1024) {
    return (n / 1024 / 1024 / 1024).toFixed(2) + " G";
  } else if (n < 1024 * 1024 * 1024 * 1024 * 1024) {
    return (n / 1024 / 1024 / 1024 / 1024).toFixed(2) + " T";
  } else {
    return (n / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2) + " P";
  }
}

// 修改 zip 路径（防止同名被覆盖，数字自增）
function renameZipName(zipFile: string, num: number) {
  let n = zipFile.lastIndexOf("/");
  const filename = n > -1 ? zipFile.substring(n + 1) : zipFile; // 获取文件名

  n = filename.lastIndexOf(".");
  if (n === -1) return zipFile + "_" + num; // 没有后缀就直接追加
  if (n === filename.length - 1) return zipFile + num; // 特殊情况，直接追加
  const ext = filename.substring(n);
  const reg = new RegExp(ext.replace(".", "\\.") + "$");
  return zipFile.replace(reg, "_" + num + ext);
}

// 下载 ZIP
function downloadZip(blob: Blob) {
  const el = document.createElement("a");
  el.href = URL.createObjectURL(blob);
  el.download = `${chrome.devtools.inspectedWindow.tabId}-${getDate()}.zip`;
  el.click();
}

// 获取当前时间
function getDate() {
  const d = new Date();
  d.setMinutes(-d.getTimezoneOffset() + d.getMinutes(), d.getSeconds(), 0);
  let s = d.toISOString();
  s = s.replace("T", " ");
  s = s.replace(".000Z", "");
  s = s.replace(/\D/g, "");
  return s;
}
