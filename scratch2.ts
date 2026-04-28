import axios from 'axios';

async function main() {
  try {
    const res = await axios.get('http://localhost:3001/api/properties/7d5cd1db-be00-4918-8d17-d77e16293742', {
      headers: {
        Authorization: 'Bearer MOCK_TOKEN' // Since the api isn't easily accessible from scratch without auth, maybe not the best way...
      }
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
main();
