import { supabase } from '../supabaseClient';

// اضافة وصل جديد
export const addReceipt = async (receipt) => {
  const { data, error } = await supabase
    .from('receipts')
    .insert([
      {
        store_name: receipt.storeName,
        amount: parseFloat(receipt.amount),
        date: receipt.date,
        notes: receipt.notes,
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding receipt:', error);
    throw error;
  }
  return data;
};

// جلب جميع الوصولات
export const getReceipts = async () => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
  return data;
};

// حذف وصل
export const deleteReceipt = async (id) => {
  const { data, error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
  return data;
};
