import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type Voice = { id:string; audio_url:string; duration:number; device_id:string }
const deviceId = () => { const k='voice_bbs_device_id'; let v=localStorage.getItem(k); if(!v){v=crypto.randomUUID();localStorage.setItem(k,v)} return v }
const hash = (s:string) => [...s].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)

function VoiceBubble({voice,mine,playing,onPlay,onLongPress}:{voice:Voice;mine:boolean;playing:boolean;onPlay:()=>void;onLongPress:()=>void}){
 const timer=useRef<number|null>(null); const suppress=useRef(false)
 const h=hash(voice.id); const size=64+Math.min(70,Math.max(0,voice.duration*8))
 const style={width:size,height:size,left:`${10+h%80}%`,top:`${8+Math.floor(h/97)%74}%`,animationDelay:`-${(h>>3)%10}s`} as React.CSSProperties
 const down=(e:React.PointerEvent)=>{e.stopPropagation(); timer.current=window.setTimeout(()=>{suppress.current=true;navigator.vibrate?.(20);onLongPress()},300)}
 const up=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null}}
 const click=()=>{if(suppress.current){suppress.current=false;return}onPlay()}
 return <button className={`voice-bubble ${playing?'playing':''}`} style={style} aria-label={`${voice.duration.toFixed(1)}秒の声`} onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onClick={click}><span className="wave"/><span className="duration">{playing?'♪':`${voice.duration.toFixed(1)}s`}</span>{mine&&<span className="mine">自</span>}</button>
}

function Recorder({onRecorded}:{onRecorded:(duration:number)=>void}){
 const [recording,setRecording]=useState(false); const [elapsed,setElapsed]=useState(0); const rec=useRef<MediaRecorder|null>(null); const started=useRef(0); const timer=useRef<number|null>(null)
 const start=async()=>{if(recording)return; try{const stream=await navigator.mediaDevices.getUserMedia({audio:true}); const r=new MediaRecorder(stream); rec.current=r; started.current=Date.now(); r.onstop=()=>{stream.getTracks().forEach(t=>t.stop());onRecorded(Math.min(30,(Date.now()-started.current)/1000));setElapsed(0)}; r.start();setRecording(true); timer.current=window.setInterval(()=>setElapsed((Date.now()-started.current)/1000),100)}catch{alert('マイクを許可してください')}}
 const stop=()=>{if(rec.current?.state==='recording')rec.current.stop();if(timer.current)clearInterval(timer.current);setRecording(false)}
 return <div className={`recorder ${recording?'recording':''}`} onPointerDown={start} onPointerUp={stop} onPointerLeave={()=>recording&&stop()}>{recording?`吹き込み中… ${Math.ceil(elapsed)}s / 30s`:'長押しで吹き込む'}</div>
}

function App(){
 const [voices,setVoices]=useState<Voice[]>([]); const [playing,setPlaying]=useState<string|null>(null); const [status,setStatus]=useState('React PoC')
 const myId=useMemo(deviceId,[])
 useEffect(()=>{fetch('/api/threads?limit=1').catch(()=>{})},[])
 const addDemo=()=>{const id=crypto.randomUUID();setVoices(v=>[...v,{id,audio_url:'',duration:2+Math.random()*3,device_id:myId}]);setStatus('録音UIから投稿処理へ接続可能')}
 return <main><header><button aria-label="ロビーへ">‹</button><div><strong>Voice BBS</strong><small>{status}</small></div><span className="badge">React + Vite PoC</span></header><section className="room" aria-label="Voice bubbles">{voices.length===0&&<p className="empty">React PoC — 泡に触れると聞く</p>}{voices.map(v=><VoiceBubble key={v.id} voice={v} mine={v.device_id===myId} playing={playing===v.id} onPlay={()=>{if(v.audio_url){const a=new Audio(v.audio_url);setPlaying(v.id);a.onended=()=>setPlaying(null);void a.play()}}} onLongPress={()=>setStatus('自分の声: 削除アクション')}}/></section><footer><Recorder onRecorded={()=>addDemo()}/><p>Vue版と同じ VoiceBubble / pointer / audio 操作を最小条件で比較するためのPoC</p></footer></main>
}

createRoot(document.getElementById('root')!).render(<App />)
