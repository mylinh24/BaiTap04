// src/config/elasticConfig.js
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

(async () => {
  try {
    await client.ping();
    console.log('Kết nối Elasticsearch thành công!');
  } catch (error) {
    console.error('Lỗi kết nối Elasticsearch:', error.message);
  }
})();

module.exports = client;