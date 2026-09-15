import { useEffect, useState } from 'react'
import { Bell, Coins, House, Package, Receipt, Trophy, Users, Wallet, Clock, PanelRightClose } from 'lucide-react'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import type { ProductAudience, ProductPreviewView } from '../platform-product-content'
import { ProductUiProvider, StatTile, ProductCard, Card, CardTitle, Chip, TableScroll, Th, Td, Tr, LineBarChart, PipelineCard, MaterialsCard, AffiliateLeaderboard, RowCard, RowCardLine, ResponsiveRows } from './product-ui'
import logo from '../assets/logo-header.webp'
import logoDark from '../assets/logo-header-dark.webp'
import '../product-utilities.css'
import '../product-preview.css'

// This is a read-only composition of the real app's components, not a live
// account. Fixtures are deliberately generic and identified on every preview.
export function ProductAppPreview({ view = 'dashboard', audience = 'marketer', compact = false }: { view?: ProductPreviewView; audience?: ProductAudience; compact?: boolean }) {
  const { lang, L } = useLang()
  const { dark } = usePageTheme()
  const [screen, setScreen] = useState(view)
  useEffect(() => setScreen(view), [view, audience])
  const company = audience === 'company'
  const titles: Record<ProductPreviewView, string> = {
    dashboard: L('لوحة التحكم', 'Dashboard'), company: L('لوحة التحكم', 'Dashboard'),
    products: L('المنتجات', 'Products'), customers: L('إدارة العملاء', 'CRM'),
    commissions: company ? L('الفوترة', 'Billing') : L('العمولات', 'Commissions'),
    materials: L('مواد البيع', 'Sales materials'), leaderboard: L('لوحة الصدارة', 'Leaderboard'),
  }
  const nav: { view: ProductPreviewView; icon: typeof House }[] = [
    { view: company ? 'company' : 'dashboard', icon: House },
    { view: 'products', icon: Package },
    ...(!company ? [{ view: 'customers' as const, icon: Users }] : []),
    { view: 'commissions', icon: Receipt },
    ...(!company ? [{ view: 'leaderboard' as const, icon: Trophy }] : []),
  ]
  const stats = company ? [
    { label: L('عمولة سيلزاب', 'SalesUp commission'), value: L('3,000 ر.س.', 'SAR 3,000'), icon: <Coins /> },
    { label: L('إجمالي قيمة الصفقات', 'Total deal value'), value: L('15,000 ر.س.', 'SAR 15,000'), icon: <Wallet /> },
    { label: L('الصفقات المقفلة', 'Closed deals'), value: '3', icon: <Receipt /> },
  ] : [
    { label: L('عمولاتي', 'My commissions'), value: L('1,200 ر.س.', 'SAR 1,200'), icon: <Wallet /> },
    { label: L('تحت الإجراء', 'In progress'), value: L('300 ر.س.', 'SAR 300'), icon: <Clock /> },
    { label: L('منتجات انضممت لها', 'Joined products'), value: '2', icon: <Package /> },
  ]
  const products = [
    { name: L('نظام نقاط بيع', 'Point-of-sale system'), brandName: L('شركة توضيحية', 'Example company'), reward: company ? L('سيلز أب 20٪ لكل عملية بيع', 'SalesUp 20% per sale') : L('عمولتك 600 ر.س. لكل عملية بيع', 'Your commission SAR 600 per sale'), rewardCaption: company ? undefined : L('10٪ من 6,000 ر.س.', '10% of SAR 6,000'), types: [L('حلول تقنية', 'Technology'), L('منتج', 'Product')] },
    { name: L('اشتراك إدارة المتاجر', 'Store management subscription'), brandName: L('شركة توضيحية', 'Example company'), reward: company ? L('سيلز أب 20٪ لكل عملية بيع', 'SalesUp 20% per sale') : L('عمولتك 300 ر.س. لكل عملية بيع', 'Your commission SAR 300 per sale'), rewardCaption: company ? undefined : L('10٪ من 3,000 ر.س.', '10% of SAR 3,000'), types: [L('حلول تقنية', 'Technology'), L('اشتراك', 'Subscription')] },
  ]
  const transactions = [
    { customer: L('عميل توضيحي ١', 'Example customer 1'), product: products[0].name, amount: company ? '6,000' : '600', status: company ? L('معتمدة', 'Approved') : L('تم التحويل', 'Transferred') },
    { customer: L('عميل توضيحي ٢', 'Example customer 2'), product: products[0].name, amount: company ? '6,000' : '600', status: company ? L('معتمدة', 'Approved') : L('تم التحويل', 'Transferred') },
    { customer: L('عميل توضيحي ٣', 'Example customer 3'), product: products[1].name, amount: company ? '3,000' : '300', status: company ? L('معتمدة', 'Approved') : L('اعتُمدت — تُحوَّل لك خلال الأيام الجاية', 'Approved — transferred to you in the coming days') },
  ]
  const moneyCards = transactions.map((row, index) => (
    <RowCard key={row.customer}>
      <RowCardLine label={L('العميل', 'Customer')}>{row.customer}</RowCardLine>
      <RowCardLine label={L('المنتج', 'Product')}>{row.product}</RowCardLine>
      <RowCardLine label={company ? L('المبلغ', 'Amount') : L('العمولة', 'Commission')} numeric>{row.amount} {L('ر.س.', 'SAR')}</RowCardLine>
      <RowCardLine label={L('الحالة', 'Status')}><Chip tone={index === 2 ? 'muted' : 'primary'}>{row.status}</Chip></RowCardLine>
    </RowCard>
  ))
  const moneyTable = <ResponsiveRows
    className="product-app-money-rows"
    cards={moneyCards}
    table={<TableScroll label={L('آخر الصفقات — بيانات توضيحية', 'Recent deals — example data')}>
      <thead><tr><Th>{L('العميل', 'Customer')}</Th><Th>{L('المنتج', 'Product')}</Th><Th numeric>{company ? L('المبلغ', 'Amount') : L('العمولة', 'Commission')}</Th><Th>{L('الحالة', 'Status')}</Th></tr></thead>
      <tbody>{transactions.map((row, index) => <Tr key={row.customer}><Td>{row.customer}</Td><Td>{row.product}</Td><Td numeric>{row.amount} {L('ر.س.', 'SAR')}</Td><Td><Chip tone={index === 2 ? 'muted' : 'primary'}>{row.status}</Chip></Td></Tr>)}</tbody>
    </TableScroll>}
  />
  const billingRows = transactions.map((row, index) => ({
    ...row,
    charge: ['1,200', '1,200', '600'][index] ?? '0',
    action: L('عرض', 'View'),
  }))
  const billingCards = billingRows.map(row => (
    <RowCard key={row.customer}>
      <RowCardLine label={L('المنتج', 'Product')}>{row.product}</RowCardLine>
      <RowCardLine label={L('التاريخ', 'Date')} numeric>15/09/2026</RowCardLine>
      <RowCardLine label={L('المبلغ', 'Amount')} numeric>{row.charge} {L('ر.س.', 'SAR')}</RowCardLine>
      <RowCardLine label={L('الحالة', 'Status')}><Chip tone="primary">{L('معتمدة', 'Approved')}</Chip></RowCardLine>
    </RowCard>
  ))
  const billingTable = <ResponsiveRows
    className="product-app-money-rows"
    cards={billingCards}
    before={<div className="product-app-billing-total"><span>{L('إجمالي عمولات سيلزاب', 'Total SalesUp commissions')}</span><b>{L('3,000 ر.س.', 'SAR 3,000')}</b></div>}
    table={<TableScroll label={L('سجل الفوترة — بيانات توضيحية', 'Billing ledger — example data')}>
      <thead><tr><Th>{L('المنتج', 'Product')}</Th><Th>{L('التاريخ', 'Date')}</Th><Th numeric>{L('المبلغ', 'Amount')}</Th><Th>{L('الحالة', 'Status')}</Th><Th>{L('الإجراء', 'Action')}</Th></tr></thead>
      <tbody>{billingRows.map(row => <Tr key={row.customer}><Td>{row.product}</Td><Td><span dir="ltr">15/09/2026</span></Td><Td numeric>{row.charge} {L('ر.س.', 'SAR')}</Td><Td><Chip tone="primary">{L('معتمدة', 'Approved')}</Chip></Td><Td>{row.action}</Td></Tr>)}</tbody>
    </TableScroll>}
  />
  return <ProductUiProvider locale={lang}>
    <div className={`product-app${compact ? ' product-app--compact' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} aria-label={L('معاينة من واجهة SalesUp، ببيانات توضيحية', 'SalesUp UI preview, with example data')}>
      <div className="product-app-frame">
        <aside className="product-app-sidebar" aria-label={L('تنقّل المعاينة', 'Preview navigation')}>
          <img src={dark ? logoDark : logo} alt="SalesUp" />
          {nav.map(item => <button type="button" key={item.view} onClick={() => setScreen(item.view)} className={screen === item.view ? 'is-current' : ''} aria-pressed={screen === item.view}><item.icon /><span>{titles[item.view]}</span></button>)}
        </aside>
        <div className="product-app-body">
          <div className="product-app-topbar"><span><PanelRightClose />{titles[screen]}</span><span><Bell /><b>{company ? L('شركة', 'Company') : L('مسوّق', 'Agent')}</b><i>{L('س', 'S')}</i></span></div>
          <div className="product-app-content">
            {(screen === 'dashboard' || screen === 'company') && <>
              <div className="product-app-welcome"><h3>{L('مرحباً بك', 'Welcome back')} <span aria-hidden="true">👋</span></h3><p>{company ? L('هذا ملخص منتجاتك ومبيعاتها.', 'Your products and sales at a glance.') : L('هذا ملخص مبيعاتك وأرباحك.', 'Your sales and earnings at a glance.')}</p></div>
              <div className="product-app-stats">{stats.map((stat, index) => <StatTile key={stat.label} {...stat} tone={index === 0 ? 'brand' : 'default'} />)}</div>
              <Card className="product-app-chart"><CardTitle>{L('الصفقات بالشهر', 'Deals by month')}</CardTitle><p className="product-app-muted">{L('آخر ٦ شهور • أرقام المثال', 'Last 6 months • example figures')}</p><LineBarChart bars={[0, 0, 0, 1, 1, 1]} barLabel={L('مقفلة', 'Closed')} ariaLabel={L('ثلاث صفقات مقفلة في هذا المثال', 'Three closed deals in this example')} height={92} /><div className="product-app-months">{L(['أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر'], ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']).map(month => <span key={month}>{month}</span>)}</div></Card>
              {!compact && <><h4>{L('آخر الصفقات', 'Recent deals')}</h4>{moneyTable}</>}
            </>}
            {screen === 'products' && <>
              <div className="product-app-screen-head"><h3>{titles.products}</h3><span className="product-app-filter">{L('الكل', 'All')}</span></div>
              <div className="product-app-products">{products.map(offer => <ProductCard key={offer.name} offer={offer} chips={company ? <Chip tone="primary">{L('نشط', 'Live')}</Chip> : undefined} />)}</div>
            </>}
            {screen === 'commissions' && <>
              <h3>{titles.commissions}</h3>
              {company ? <>{billingTable}<p className="product-app-muted">{L('السجل يوضح عمولة سيلزاب على الصفقات المعتمدة. بيانات المثال للشرح فقط.', 'The ledger shows SalesUp commission on approved deals. Example data for illustration only.')}</p></> : <><div className="product-app-stats">{stats.slice(0, 2).map((stat, index) => <StatTile key={stat.label} {...stat} tone={index === 0 ? 'brand' : 'default'} />)}</div>{moneyTable}<p className="product-app-muted">{L('اعتماد الصفقة والتحويل مرحلتان منفصلتان.', 'Deal approval and payment are separate stages.')}</p></>}
            </>}
            {screen === 'customers' && <CustomerPreview />}
            {screen === 'materials' && <>
              <h3>{titles.materials}</h3><Card><CardTitle>{products[0].name}</CardTitle><MaterialsCard files={[
                { id: 'guide', fileName: L('دليل المنتج.pdf', 'Product guide.pdf'), kind: 'pdf', pageCount: 4, sizeBytes: 184320 },
                { id: 'script', fileName: L('نص تقديم المنتج.txt', 'Product pitch.txt'), kind: 'text', sizeBytes: 6144 },
              ]} /><p className="product-app-muted">{L('اقرأ مواد البيع وتعرّف على المنتج قبل ما تبدأ.', 'Read the sales materials and get to know the product.')}</p></Card>
            </>}
            {screen === 'leaderboard' && <>
              <h3>{titles.leaderboard}</h3><AffiliateLeaderboard boards={{
                month: { periodKey: L('سبتمبر 2026', 'Sep 2026'), rows: [
                  { rank: 1, label: L('مسوّق توضيحي ١', 'Example agent 1'), level: 3, points: 920, money: '1,200 ر.س.', dealsLabel: L('3 صفقات', '3 deals'), isMe: true },
                  { rank: 2, label: L('مسوّق توضيحي ٢', 'Example agent 2'), level: 2, points: 680, money: '900 ر.س.', dealsLabel: L('2 صفقة', '2 deals') },
                  { rank: 3, label: L('مسوّق توضيحي ٣', 'Example agent 3'), level: 1, points: 410, money: '600 ر.س.', dealsLabel: L('1 صفقة', '1 deal') },
                ] },
                year: { periodKey: L('2026', '2026'), rows: [
                  { rank: 1, label: L('مسوّق توضيحي ١', 'Example agent 1'), level: 3, points: 2340, money: '3,600 ر.س.', dealsLabel: L('8 صفقات', '8 deals'), isMe: true },
                  { rank: 2, label: L('مسوّق توضيحي ٢', 'Example agent 2'), level: 2, points: 1880, money: '2,400 ر.س.', dealsLabel: L('6 صفقات', '6 deals') },
                ] },
                all: { rows: [
                  { rank: 1, label: L('مسوّق توضيحي ١', 'Example agent 1'), level: 3, points: 5120, money: '7,800 ر.س.', dealsLabel: L('18 صفقة', '18 deals'), isMe: true },
                  { rank: 2, label: L('مسوّق توضيحي ٢', 'Example agent 2'), level: 2, points: 4210, money: '6,100 ر.س.', dealsLabel: L('14 صفقة', '14 deals') },
                ] },
              }} />
            </>}
          </div>
        </div>
      </div>
      <div className="product-app-disclosure"><span>{L('من واجهة المنصة', 'From the product UI')}</span><span>{L('بيانات توضيحية — مو حساب حقيقي', 'Example data — not a live account')}</span></div>
    </div>
  </ProductUiProvider>
}

function CustomerPreview() {
  const { L } = useLang()
  return <><h3>{L('إدارة العملاء', 'CRM')}</h3><div className="product-app-pipeline">{L(['عملاء جدد', 'عملاء مؤهّلون', 'قيد الإغلاق'], ['New leads', 'Qualified', 'Closing']).map((stage, index) => <div className="product-app-lane" key={stage}><h4>{stage}<span>1</span></h4><PipelineCard lead={{ name: L('عميل توضيحي ' + (index + 1), 'Example customer ' + (index + 1)), value: '6,000', commission: '600', addedOn: '15/09/26', expectedCloseOn: '30/09/26' }} /></div>)}</div></>
}
