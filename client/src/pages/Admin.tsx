import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function Admin() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {t('admin.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('admin.body')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
