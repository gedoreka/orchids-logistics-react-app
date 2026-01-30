
// Translation helper mimicking the PHP trans('key', 'default') behavior
export function trans(key: string, defaultValue: string): string {
  // In a real app, this would load translations from a JSON file or DB
  // For now, we return the default value or the key itself
  const translations: Record<string, string> = {
    'cannot_delete_account_has_expenses': 'لا يمكن حذف هذا الحساب لأنه مرتبط بمصروفات.',
    'account_deleted_successfully': 'تم حذف الحساب بنجاح',
    'error_occurred': 'حدث خطأ.',
    // Add more translations as needed
  };

  return translations[key] || defaultValue;
}
