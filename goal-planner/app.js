const $=id=>document.getElementById(id);
const money=n=>"NT$"+Math.round(n).toLocaleString("en-US");
const PRE={retire:[10000000,25],house:[3000000,8],edu:[2000000,15],travel:[300000,3],emerg:[300000,2]};
const fv=(pv,pmt,r,n)=>{if(!r)return pv+pmt*n;const g=Math.pow(1+r,n);return pv*g+pmt*(g-1)/r};
const pmtReq=(t,pv,r,n)=>{if(!r)return(t-pv)/n;const g=Math.pow(1+r,n);return(t-pv*g)*r/(g-1)};
const pvReq=(t,pmt,r,n)=>{if(!r)return t-pmt*n;const g=Math.pow(1+r,n);return t/g-pmt*(1-1/g)/r};
function rateReq(t,pv,pmt,n){let lo=0,hi=0.03;if(fv(pv,pmt,0,n)>=t)return 0;
 for(let i=0;i<60;i++){const m=(lo+hi)/2;fv(pv,pmt,m,n)<t?lo=m:hi=m}return hi*12}
function nperReq(t,pv,pmt,r){for(let n=1;n<=1200;n++)if(fv(pv,pmt,r,n)>=t)return n;return null}
function chart(Y,target,r,pv,pmt,pmtNeed){
 const W=640,H=260,L=56,B=28,T=10,R=10;let a=[],b=[];
 for(let y=0;y<=Y;y++){a.push(fv(pv,pmt,r,y*12));b.push(fv(pv,Math.max(pmtNeed,0),r,y*12))}
 const mx=Math.max(target,...a,...b)*1.05,X=y=>L+(W-L-R)*y/Y,Yp=v=>T+(H-T-B)*(1-v/mx);
 const path=s=>s.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Yp(v).toFixed(1)).join("");
 let g="";for(let i=0;i<=4;i++){const v=mx*i/4;g+=`<line x1="${L}" x2="${W-R}" y1="${Yp(v)}" y2="${Yp(v)}" stroke="var(--bd)"/><text x="${L-6}" y="${Yp(v)+4}" text-anchor="end" font-size="11" fill="var(--mu)">${(v/10000).toFixed(0)}萬</text>`}
 const step=Math.max(1,Math.ceil(Y/6));for(let y=0;y<=Y;y+=step)g+=`<text x="${X(y)}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--mu)">${y}年</text>`;
 return `<div class="scroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="資產成長圖">${g}
 <line x1="${L}" x2="${W-R}" y1="${Yp(target)}" y2="${Yp(target)}" stroke="var(--bad)" stroke-dasharray="5 4"/>
 <path d="${path(b)}" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-dasharray="2 3"/>
 <path d="${path(a)}" fill="none" stroke="var(--ac)" stroke-width="2.5"/></svg></div>
 <p class="note"><span style="color:var(--ac)">━</span> 目前計畫　<span style="color:var(--ac2)">┅</span> 達標所需計畫　<span style="color:var(--bad)">┅</span> 目標金額</p>`}
function calc(){
 const Y=Math.max(1,Math.round(+$("years").value||1)),n=Y*12,ann=(+$("rate").value||0)/100,inf=(+$("infl").value||0)/100,r=ann/12;
 const pv=+$("pv").value||0,pmt=+$("pmt").value||0;let T0=+$("target").value||0;
 const T=$("real").checked?T0*Math.pow(1+inf,Y):T0;
 const plan=fv(pv,pmt,r,n),gap=T-plan,ratio=plan/T;
 const need=pmtReq(T,pv,r,n),needPV=pvReq(T,pmt,r,n),needR=rateReq(T,pv,pmt,n),needN=nperReq(T,pv,pmt,r);
 const st=ratio>=1?["已達標",'var(--ok)']:ratio>=0.8?["接近目標",'var(--wa)']:["落後目標",'var(--bad)'];
 const paid=pv+pmt*n,realPlan=plan/Math.pow(1+inf,Y);
 let tips="";
 if(gap<=0){tips+=`<div class="tip">✅ 照目前計畫，預估可超出目標 <b>${money(-gap)}</b>。可考慮：縮短年限、略降每月投入，或把餘裕分配給其他目標。</div>`;
  if(need>0)tips+=`<div class="tip">每月最少只需 <b>${money(need)}</b> 即可達標，比現在少 ${money(pmt-need)}。</div>`}
 else{tips+=`<div class="tip">📉 目前計畫預估缺口 <b>${money(gap)}</b>（達成率 ${(ratio*100).toFixed(0)}%）。你有四條路可選：</div>
 <div class="tip"><b>A. 增加月投入：</b>每月提高到 <b>${money(need)}</b>（多 ${money(need-pmt)}，約月薪的 ${"{PCT}"}）</div>
 <div class="tip"><b>B. 延長年限：</b>${needN?`維持目前投入，約需 <b>${(needN/12).toFixed(1)} 年</b>（多 ${(needN/12-Y).toFixed(1)} 年）`:"超過 100 年，單靠延長年限不可行"}</div>
 <div class="tip"><b>C. 提高報酬：</b>需年化約 <b>${(needR*100).toFixed(1)}%</b>${needR>0.09?" ⚠️ 超過長期合理預期，不建議冒險追求":needR>ann+0.03?" ⚠️ 需承擔較高風險":" ，屬可評估範圍"}</div>
 <div class="tip"><b>D. 一次補足本金：</b>若維持月投入，現在需準備 PV ＝ <b>${money(Math.max(needPV,0))}</b>（再多 ${money(Math.max(needPV-pv,0))}）</div>`}
 if(ratio<1&&ratio>=0.8)tips+=`<div class="tip">💡 差距不大，A 與 B 組合（小幅加碼＋延 1～2 年）通常最輕鬆。</div>`;
 if(Y<=3&&ann>0.04)tips+=`<div class="tip">⏳ 年限短，建議以定存、貨幣型工具為主，避免高波動資產；報酬率可下調至 2%～3% 再試算。</div>`;
 if(Y>=15)tips+=`<div class="tip">📈 長期目標最怕中斷，建議設定自動扣款，並每年檢視、隨薪資調升投入。</div>`;
 const sc=[ann-0.02,ann,ann+0.02].map((a,i)=>{const a2=Math.max(a,0),v=fv(pv,pmt,a2/12,n);return `<tr><td>${["保守","基準","樂觀"][i]}（${(a2*100).toFixed(1)}%）</td><td>${money(v)}</td><td style="color:${v>=T?"var(--ok)":"var(--bad)"}">${v>=T?"達標":"缺 "+money(T-v)}</td></tr>`}).join("");
 $("out").innerHTML=`<div class="card"><h2>③ 分析結果　<span class="badge" style="background:${st[1]}">${st[0]}</span></h2>
 <div class="kpis">
 <div class="kpi"><small>目標金額（${Y} 年後面額）</small><b>${money(T)}</b><br><em>${$("real").checked?`今日 ${money(T0)} × 通膨`:"未計通膨"}</em></div>
 <div class="kpi"><small>FV：目前計畫預估</small><b>${money(plan)}</b><br><em>相當今日購買力 ${money(realPlan)}</em></div>
 <div class="kpi"><small>${gap>0?"缺口":"超額"}</small><b style="color:${gap>0?"var(--bad)":"var(--ok)"}">${money(Math.abs(gap))}</b><br><em>你投入 ${money(paid)}，複利貢獻 ${money(plan-paid)}</em></div>
 </div></div>
 <div class="card"><h2>三種反推：想達標需要什麼？</h2>
 <table><tr><th>求解</th><th>需要</th><th>目前</th></tr>
 <tr><td>PMT 每月投入</td><td><b>${money(Math.max(need,0))}</b></td><td>${money(pmt)}</td></tr>
 <tr><td>PV 現有本金</td><td><b>${money(Math.max(needPV,0))}</b></td><td>${money(pv)}</td></tr>
 <tr><td>年化報酬率</td><td><b>${(needR*100).toFixed(1)}%</b></td><td>${(ann*100).toFixed(1)}%</td></tr></table></div>
 <div class="card"><h2>資產成長軌跡</h2>${chart(Y,T,r,pv,pmt,need)}</div>
 <div class="card"><h2>報酬情境（±2%）</h2><table><tr><th>情境</th><th>預估 FV</th><th>對照目標</th></tr>${sc}</table></div>
 <div class="card"><h2>💡 建議</h2>${tips}</div>`.replace("{PCT}","此數字可對照你的月收入評估");
}
$("preset").onchange=e=>{const p=PRE[e.target.value];if(p){$("target").value=p[0];$("years").value=p[1]}calc()};
document.querySelectorAll("input").forEach(i=>i.addEventListener("input",calc));
calc();
