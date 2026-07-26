import { supabase } from '../supabaseClient';

// تسجيل الدخول
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// تسجيل الخروج
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// الحصول على المستخدم الحالي
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// مراقبة حالة تسجيل الدخول
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return subscription;
};

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
        returns: parseFloat(receipt.returns || 0),
        paid_amount: parseFloat(receipt.paidAmount || 0),
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

// تحديث وصل موجود
export const updateReceipt = async (id, updatedReceipt) => {
  const { data, error } = await supabase
    .from('receipts')
    .update({
      store_name: updatedReceipt.storeName,
      amount: parseFloat(updatedReceipt.amount),
      date: updatedReceipt.date,
      notes: updatedReceipt.notes,
      returns: parseFloat(updatedReceipt.returns || 0),
      paid_amount: parseFloat(updatedReceipt.paidAmount || 0),
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating receipt:', error);
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
