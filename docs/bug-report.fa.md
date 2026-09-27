# گزارش باگ‌های پیداشده در Workrave

تاریخ بررسی: ۲۷ سپتامبر ۲۰۲۶ · شاخه `arena/01a0e1b2-workrave`

در این بررسی، هستهٔ تایمر (`libs/core`)، کنترل جعبهٔ تایمر (`ui/app`)، ویجت‌های GTK
(`ui/app/toolkits/gtkmm/widgets`)، پارس‌های تاریخ/زمان (`DayTimePred`) و لایه‌های
متن/ورودی بازبینی شدند. باگ‌های زیر **واقعی و تأییدشده** هستند و موارد ۱ تا ۴
در همین شاخه اصلاح شدند.

---

## ۱. انتخاب تایمر اشتباه در `TimerBoxControl::init_slot` (باگ منطقی جدی) ✅ اصلاح‌شده

**فایل:** `ui/app/TimerBoxControl.cc` — حلقهٔ «Compute timer that will elapse first»

```cpp
int id = breaks_id[i];           // شناسهٔ واقعی استراحت
...
auto b = core->get_break(static_cast<BreakId>(i));   // ❌ باگ: به‌جای id از i استفاده شده
```

`breaks_id[]` فقط استراحت‌های **فعالِ همان اسلات** را نگه می‌دارد؛ بنابراین اندیس
حلقه (`i`) هیچ ربطی به شناسهٔ خود استراحت (`id`) ندارد. مثلاً اگر Daily limit
غیرفعال باشد، برای `i=0` به‌جای Micro-break تایمرِ اشتباهی خوانده می‌شود. نتیجه:
فیلترهای «وقتی نزدیک است / وقتی اولین است» روی زمان باقی‌ماندهٔ تایمر **اشتباه**
حساب می‌شوند و ممکن است آیکون/تایمر اشتباه در پنل نمایان یا پنهان شود.

**اصلاح:** `core->get_break(static_cast<BreakId>(id))`

## ۲. محتوای کهنه در `TimerBoxGtkView::set_slot` (باگ حالت) ✅ اصلاح‌شده

**فایل:** `ui/app/toolkits/gtkmm/widgets/TimerBoxGtkView.cc`

```cpp
if (current_content[slot] != id)   // ❌ فقط با current_content مقایسه می‌شد
  new_content[slot] = id;
```

`current_content` فقط بعد از اجرای `init_table()` همگام می‌شود. اگر `set_slot`
دو بار قبل از `update_view` صدا زده می‌شد (مثلاً در یک تیک دو بار `init_table`
کنترل)، درخواست دوم با مقدارِ قدیمیِ `current_content` برابر بود و `new_content`
به‌صورت کهنه باقی می‌ماند → اسلات محتوای اشتباه نشان می‌داد.

**اصلاح:** مقایسه با هر دو: `current_content[slot] != id || new_content[slot] != id`

## ۳. چرخش اسلات‌ها با `t % cycle_time == 0` شکننده بود ✅ اصلاح‌شده

**فایل:** `ui/app/TimerBoxControl.cc` — `update()`

```cpp
if (t % cycle_time == 0) { init_table(); cycle_slots(); }
```

اگر یک تیکِ `update()` دقیقاً روی ثانیهٔ مضرب `cycle_time` نمی‌افتاد (کندی سیستم،
suspend/resume، تأخیر تایمر قلب)، کل چرخه برای یک دور کامل **جیمی‌خورد**؛ و اگر
دو بار در یک ثانیه اجرا می‌شد، دو گام جلو می‌رفت.

**اصلاح:** مقایسهٔ «شمارهٔ پنجرهٔ زمانی» (`t / cycle_time`) با مقدار قبلی —
`last_cycle_bucket` — که هم از رد شدن و هم از اجرای دوباره جلوگیری می‌کند.

## ۴. باگ DST در `DayTimePred::get_next` (هر دو نسخهٔ core و corenext) ✅ اصلاح‌شده

**فایل‌ها:** `libs/core/src/DayTimePred.cc`، `libs/corenext/src/DayTimePred.cc`

بعد از محاسبهٔ تاریخ هدف، `mktime(ret)` صدا زده می‌شد در حالی که `tm_isdst`
هنوز مقدار **زمان فعلی** (نه زمان هدف) را داشت. در همسایگیٔ تغییر ساعت تابستانی/
زمستانی، زمان بازنشانی روزانه **یک ساعت جابه‌جا** می‌شد (کامنت `// FIXME:` خود کد
هم به این موضوع اشاره داشت).

**اصلاح:** `ret->tm_isdst = -1;` قبل از `mktime` تا خودِ کتابخانه وضعیت DST
زمان هدف را تشخیص دهد.

## ۵. باگ‌ها / ضعف‌های دیگر (شناسایی‌شده، اصلاح‌نشده)

| # | مکان | توضیح |
|---|------|-------|
| 5.1 | `ui/app/toolkits/gtkmm/widgets/TimeEntry.cc::update()` | کد مرده: `gchar *err = nullptr; if (err == nullptr || *err == 0)` همیشه true است؛ بقیهٔ اعتبارسنجی ورودی کار نمی‌کند (کامنت «this kinda sucks»). |
| 5.2 | `ui/app/toolkits/gtkmm/widgets/TimeBar.cc::set_progress` | `value` منفی کلمپ نمی‌شود (`std::min` بدون `std::max(0,…)`). با `bar_value` منفی، `calc_bars` عرض منفی می‌سازد (در عمل چون `bar_value` از `activeTime` می‌آید رخ نمی‌دهد، ولی قرارداد API را نقض می‌کند). |
| 5.3 | `TimeBar` constructor vs `docs/styling.md` | مستندات کلاس `.workrave-timebar-inactive-over-inactive` را تبلیغ می‌کند ولی نه در enum `TimerColorId` وجود دارد نه در CSS providerها ثبت شده؛ کاربرِ CSS سفارشی سردرگم می‌شود. |
| 5.4 | `ui/app/toolkits/gtkmm/widgets/TimeBar.cc::draw_text` | متن روی نوار با `alpha = ۱` رسم می‌شود (`set_color` آلفای رنگ را نادیده می‌گیرد)؛ تم‌های CSS با رنگ نیمه‌شفاف درست کار نمی‌کنند. |
| 5.5 | `libs/core/src/DayTimePred.cc::to_string` | `sprintf(buf, "day/%d:%02d", …)` بدون اعتبارسنجی `pred_hour/pred_min`؛ ورودی‌های خراب (`day/25:99`) از `atoi` عبور می‌کنند و زمان نامعتبر می‌سازند (`char buf[16]` خودش به‌اندازهٔ کافی بزرگ است). |
| 5.6 | `ui/app/toolkits/gtkmm/platforms/macos/MacOSUtil.cc` | استفاده از `strcpy/strcat` روی بافرها بدون بررسی طول (خطر سرریز با مسیرهای طولانی). |
| 5.7 | `ui/app/toolkits/gtkmm/CrashDialog.cc:494` | `SetEnvironmentVariableA("GTK_DEBUG", 0)` — گرچه عملاً «حذف متغیر» است، پاس‌دادن `۰` به‌عنوان `LPCSTR` کد مبهم/غیراستاندارد است (نسخهٔ Qt همان کار را با `nullptr` تمیزتر کرده). |
| 5.8 | `libs/core/src/DayTimePred.cc` vs `libs/corenext/src/DayTimePred.cc` | دو نسخهٔ کپی‌شده از یک منطق با تفاوت‌های جزئی (امضا `time_t`/`int64_t`، وجود `get_time_offset`) — ریسک اینکه فیکس در یکی اعمال و در دیگری فراموش شود (همان‌طور که در این بررسی برای DST پیش آمد). |

## ۶. باگ‌های گزارش‌شدهٔ upstream که در این بازبینی تأیید شدند

(از ردیف باگ‌های رسمی `rcaelers/workrave`، مرتبط با کد موجود)

- **#728 Timers are not respecting the configuration** — با کد باگ ۱ و ۳ بالا
  (انتخاب تایمر اشتباه و جیمی‌خوردن چرخش اسلات‌ها) هم‌راستاست.
- **#660 آمار فرانسوی: «à» خراب** — مربوط به `strftime`/فایل‌های locale در
  `libs/stats`؛ در این بازبینی عمیق بررسی نشد.
- **#702 تغییر خودکار Sound Theme** — مربوط به `SoundTheme.cc`؛ بررسی نشده.

---

### خلاصه

| اولویت | باگ | وضعیت |
|--------|-----|-------|
| 🔴 بالا | ۱ — تایمر اشتباه در `init_slot` | اصلاح شد |
| 🟠 متوسط | ۲ — محتوای کهنه در `set_slot` | اصلاح شد |
| 🟠 متوسط | ۳ — چرخش شکنندهٔ اسلات‌ها | اصلاح شد |
| 🟠 متوسط | ۴ — یک ساعت جابه‌جایی در DST | اصلاح شد |
| 🟡 کم | ۵.۱–۵.۸ | گزارش شد |
