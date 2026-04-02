const { createClient } = require('@supabase/supabase-js');
const url = 'https://ztgppltupkiajqmdsclg.supabase.co';
const key = 'sb_publishable_5GWWywWn0tmNN6Mqcd4hOQ_oAWURtu6';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123'
  });
  console.log("Error:", error?.message || error);
  console.log("Data:", data);
}
test();
