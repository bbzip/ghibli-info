/**
 * 通过环境变量设置全局代理
 * 
 * 这个文件将被 next.config.js 导入，确保在应用启动时设置代理
 */

// 设置 DNS 查询优先 IPv4
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// 定义全局代理环境变量
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 忽略证书错误
process.env.HTTP_PROXY = process.env.HTTP_PROXY || 'http://127.0.0.1:7890';
process.env.HTTPS_PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';

// 输出调试信息
console.log('全局代理已设置:', process.env.HTTP_PROXY); 