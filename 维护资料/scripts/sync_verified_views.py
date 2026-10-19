"""Apply already verified content/stories.json to static website and media overview. Does not fetch or schedule."""
from pathlib import Path
import json,re,html,datetime
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'content/stories.json').read_text())
p=root.parent/'index.html';s=p.read_text();kit=root.parent/'assets/red-point-media-kit.html';k=kit.read_text()
for x in items:
 date=datetime.date.fromisoformat(x['checked_at']);en=date.strftime('%d %b %Y').lstrip('0');zh=f'{date.year} 年 {date.month} 月 {date.day} 日'
 val=html.escape(x['display_views']);pattern=rf'(<article class="story-card" data-brand="{re.escape(x["brand"])}" data-rank="{x["rank"]}".*?)(</article>)'
 def update(m):
  card=re.sub(r'(<strong class="view-number">).*?(</strong>)',lambda a:a[1]+val+a[2],m[1],count=1)
  card=re.sub(r'<p class="checked-date".*?</p>','',card)
  card=card.replace('<p class="story-credit">',f'<p class="checked-date" data-zh="核查：{zh}">Checked {en}</p><p class="story-credit">')
  return card+m[2]
 s,count=re.subn(pattern,update,s,count=1,flags=re.S)
 if count!=1:raise ValueError(f'Missing story: {x["code"]}')
 kp=rf'(<tr><td>[^<]+</td><td><a href="{re.escape(x["url"])}".*?</td><td>.*?</td><td>).*?(</td></tr>)'
 k,n=re.subn(kp,lambda m:m[1]+val+'<br><small>'+x['checked_at']+'</small>'+m[2],k,count=1,flags=re.S)
 if n!=1:raise ValueError(f'Missing media overview row: {x["code"]}')
dates={x['checked_at'] for x in items}
if len(dates)==1:
 date=datetime.date.fromisoformat(next(iter(dates)));en=date.strftime('%d %b %Y').lstrip('0');zh=f'{date.year} 年 {date.month} 月 {date.day} 日'
 s=re.sub(r'(<p class="selection-note" id="story-checked-note" data-zh=").*?(</p>)',lambda m:m[1]+f'高播放精选，选自已核查的 Reels，并非完整历史排行榜。播放次数保留平台显示值；核查于 {zh}。">High-view selections among reviewed Reels, not an all-time ranking. Counts reflect the platform’s displayed values. Checked {en}.</p>',s,count=1,flags=re.S)
else:
 s=re.sub(r'(<p class="selection-note" id="story-checked-note" data-zh=").*?(</p>)',lambda m:m[1]+'高播放精选，选自已核查的 Reels，并非完整历史排行榜。各条目的核查日期见卡片。">High-view selections among reviewed Reels, not an all-time ranking. Each card shows its verification date.</p>',s,count=1,flags=re.S)
p.write_text(s);kit.write_text(k)
print(f'Updated {len(items)} verified records; no network requests or scheduled tasks.')
