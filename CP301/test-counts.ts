import { db } from './lib/db/client';

async function test() {
    const { data, error } = await db.from('organizations').select('*, org_members(count), user_positions(count), children:organizations!organizations_parent_id_fkey(count)').limit(2);
    console.log(JSON.stringify(data, null, 2));
    console.log(error);
}

test();
