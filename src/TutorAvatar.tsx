import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import type { SpeechPlayback } from './speech';
import { useCopy } from './state';
import './tutor-avatar.css';

export type TutorAvatarProps = {
  tutor: string;
  mode: 'idle' | 'speaking' | 'listening';
  speech?: Pick<SpeechPlayback,'id'|'charIndex'|'charLength'|'text'|'boundaryAt'>;
  greeting?: boolean;
  onReady?: () => void;
  onError?: (message:string) => void;
};
const sourcePromises = new Map<string, Promise<GLTF>>();
function loadSource(male: boolean) {
  const url = male ? '/models/narra-tutor-male.glb' : '/models/narra-tutor.glb';
  if (!sourcePromises.has(url)) {
    const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
    sourcePromises.set(url, loader.loadAsync(url).catch(error => { sourcePromises.delete(url); throw error; }));
  }
  return sourcePromises.get(url)!;
}
type FaceMesh = THREE.Mesh & { morphTargetDictionary:Record<string,number>; morphTargetInfluences:number[] };

/** A local skeletal character. Mouth timing follows real browser speech events,
 * with approximate word/vowel movement rather than a phoneme scoring service. */
export default function TutorAvatar(props: TutorAvatarProps) {
  const tr = useCopy(); const host = useRef<HTMLDivElement>(null);
  const live = useRef(props); live.current = props;
  const [status,setStatus] = useState<'loading'|'ready'|'error'>('loading');
  const [attempt,setAttempt] = useState(0);
  useEffect(() => {
    if (!host.current) return; const container = host.current;
    let alive = true, frame = 0, renderer:THREE.WebGLRenderer | null = null;
    let resize:ResizeObserver | null = null;
    const materials:THREE.Material[] = []; const geometries:THREE.BufferGeometry[] = [];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = new THREE.Vector2(); const aim = new THREE.Vector2();
    const onPointer = (event:PointerEvent) => { const box=container.getBoundingClientRect(); aim.set((event.clientX-box.left)/box.width-.5, .5-(event.clientY-box.top)/box.height); };
    const onLeave = () => aim.set(0,0);
    container.addEventListener('pointermove',onPointer); container.addEventListener('pointerleave',onLeave);
    setStatus('loading');
    async function initialize() {
      try {
        renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.65));
        renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
        renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
        renderer.domElement.className='call-tutor-canvas'; renderer.domElement.setAttribute('aria-hidden','true');
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(31,1,.05,30);
        camera.position.set(0,1.17,4.75); camera.lookAt(0,1.12,0);
        scene.add(new THREE.HemisphereLight(0xe9faff,0x77826d,2.15));
        const key=new THREE.DirectionalLight(0xfff4e5,3.1); key.position.set(2.3,3.7,3.6); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-1.7; key.shadow.camera.right=1.7; key.shadow.camera.top=3; key.shadow.camera.bottom=-.5; key.shadow.normalBias=.03; scene.add(key);
        const fill=new THREE.DirectionalLight(0xa5e9ff,1.6); fill.position.set(-3,1.8,2); scene.add(fill);
        const rim=new THREE.DirectionalLight(0xc9ef9e,2); rim.position.set(.5,2.5,-2); scene.add(rim);
        const floorGeo=new THREE.CircleGeometry(1.3,64); geometries.push(floorGeo);
        const floorMat=new THREE.ShadowMaterial({opacity:.2}); materials.push(floorMat);
        const floor=new THREE.Mesh(floorGeo,floorMat); floor.rotation.x=-Math.PI/2; floor.position.y=-.012; floor.receiveShadow=true; scene.add(floor);
        const diskGeo=new THREE.CircleGeometry(.72,80); geometries.push(diskGeo);
        const diskMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.2,depthWrite:false}); materials.push(diskMat);
        const disk=new THREE.Mesh(diskGeo,diskMat); disk.rotation.x=-Math.PI/2; disk.position.y=-.015; scene.add(disk);
        const male = props.tutor === 'Henry' || props.tutor === 'Dwayne';
        const source=await loadSource(male); if(!alive) return;
        const actor=cloneSkeleton(source.scene); actor.scale.multiplyScalar(1.2); actor.position.y+=.004; scene.add(actor);
        const bones=new Map<string,THREE.Bone>(); const rest=new Map<string,THREE.Quaternion>(); const faces:FaceMesh[]=[];
        const style=props.tutor === 'Camila' ? {hair:'#ad7841',suit:'#596d90'} : props.tutor === 'Henry' ? {hair:'#4b342a',suit:'#355970'} : props.tutor === 'Dwayne' ? {hair:'#242224',suit:'#42554f'} : {hair:'#c7662c',suit:'#316b6a'};
        actor.traverse(object => {
          if ((object as THREE.Bone).isBone) { const b=object as THREE.Bone; bones.set(b.name,b); rest.set(b.name,b.quaternion.clone()); }
          if (!(object as THREE.Mesh).isMesh) return;
          const mesh=object as THREE.Mesh; mesh.castShadow=true; mesh.receiveShadow=true; mesh.frustumCulled=false;
          const cloned=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(original => {
            const material=original.clone(); materials.push(material);
            if (material instanceof THREE.MeshStandardMaterial) {
              material.roughness=Math.max(.45,material.roughness);
              material.metalness=0;
              if(/ponytail/i.test(material.name)) material.color.set(style.hair);
              if(/casualsuit/i.test(material.name)) material.color.set(style.suit);
              if(male && props.tutor==='Dwayne' && /m006_head/i.test(material.name)) material.color.set('#956c53');
            }
            return material;
          }); mesh.material=Array.isArray(mesh.material)?cloned:cloned[0];
          if(mesh.morphTargetDictionary && mesh.morphTargetInfluences) faces.push(mesh as FaceMesh);
        });
        const bodyY=actor.position.y;
        const deltaQ=new THREE.Quaternion(); const euler=new THREE.Euler();
        function pose(name:string,x=0,y=0,z=0) {const b=bones.get(name),r=rest.get(name);if(b&&r)b.quaternion.copy(r).multiply(deltaQ.setFromEuler(euler.set(x,y,z)));}
        function expression(name:string,target:number,blend:number) {for(const mesh of faces){const index=mesh.morphTargetDictionary[name];if(index!==undefined)mesh.morphTargetInfluences[index]+=(target-mesh.morphTargetInfluences[index])*blend;}}
        const visemes=['viseme_PP','viseme_FF','viseme_TH','viseme_DD','viseme_kk','viseme_CH','viseme_SS','viseme_nn','viseme_RR','viseme_aa','viseme_E','viseme_I','viseme_O','viseme_U'];
        const resizeCanvas=()=>{if(!renderer)return;const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=camera.aspect < .65 ? 5.25 : 4.75;camera.updateProjectionMatrix();};
        resize=new ResizeObserver(resizeCanvas);resize.observe(container);resizeCanvas();
        setStatus('ready');live.current.onReady?.();
        const started=performance.now(); let previous=started,talking=0,listening=0,lastRender=0,welcomeAt=started,greetedSpeech=0;
        function animate(now:number) {
          if(!alive||!renderer)return;
          frame=requestAnimationFrame(animate);
          if(now-lastRender<1000/30)return;lastRender=now;
          const dt=Math.min(.08,(now-previous)/1000);previous=now;const t=(now-started)/1000;
          const reduced=reduce.matches ? .22:1; const state=live.current;
          talking=THREE.MathUtils.damp(talking,state.mode==='speaking'?1:0,5,dt);
          listening=THREE.MathUtils.damp(listening,state.mode==='listening'?1:0,4,dt);
          pointer.lerp(aim,1-Math.exp(-dt*3));
          if(state.greeting&&state.mode==='speaking'&&state.speech?.id&&state.speech.id!==greetedSpeech){greetedSpeech=state.speech.id;welcomeAt=now;}
          const welcomeTime=(now-welcomeAt)/1000;
          const welcome=state.greeting && welcomeTime<5 ? Math.sin(Math.min(1,welcomeTime/1.2)*Math.PI/2)*Math.min(1,(5-welcomeTime)/1.1)*reduced : 0;
          const gesture=(Math.sin(t*.72)+1)*.5;
          actor.position.y=bodyY+Math.sin(t*1.45)*.0025*reduced;
          pose('Hips',0,Math.sin(t*.46)*.013*reduced,Math.sin(t*.71)*.014*reduced);
          pose('Spine',Math.sin(t*1.4)*.009*reduced,0,Math.sin(t*.57)*.009*reduced);
          pose('Spine2',talking*Math.sin(t*2.1)*.014*reduced,Math.sin(t*.39)*.016*reduced,0);
          pose('Neck',listening*.025,Math.sin(t*.52)*.025*reduced,0);
          pose('Head',(.012*Math.sin(t*1.3)+talking*.018*Math.sin(t*3.7)-pointer.y*.06)*reduced,(-pointer.x*.2+Math.sin(t*.36)*.035)*reduced,listening*.045+Math.sin(t*.43)*.018*reduced);
          pose('LeftArm',(male?-.04:.56)-talking*.17*gesture*reduced,Math.sin(t*.8)*.025*reduced,(.035+talking*.13*gesture)*reduced);
          pose('RightArm',(male?.04:.56)+welcome*(male?1.2:-1.7)+(male?1:-1)*talking*.17*(1-gesture)*reduced,Math.sin(t*.65)*.025*reduced,(-.035-talking*.13*(1-gesture))*reduced+welcome*(male?.15:-.18));
          pose('LeftForeArm',-.045-talking*.25*(.6+.4*Math.sin(t*1.8))*reduced,0,Math.sin(t*.9)*.018*reduced);
          pose('RightForeArm',-.05-talking*.2*(.6+.4*Math.cos(t*1.4))*reduced+welcome*(male?1.2:-.8),0,Math.sin(t*.85)*.018*reduced);
          pose('LeftHand',.025*Math.sin(t*1.2)*reduced,talking*.06*Math.sin(t*2.4)*reduced,0);
          pose('RightHand',.025*Math.sin(t*1.1)*reduced,welcome*.28*Math.sin(t*8)+talking*.06*Math.sin(t*2)*reduced,0);
          pose('LeftUpLeg',Math.sin(t*.71)*.006*reduced,0,-Math.sin(t*.71)*.009*reduced);
          pose('RightUpLeg',-Math.sin(t*.71)*.006*reduced,0,-Math.sin(t*.71)*.009*reduced);
          pose('LeftFoot',Math.max(0,Math.sin(t*.71))*.017*reduced,0,0);pose('RightFoot',Math.max(0,-Math.sin(t*.71))*.017*reduced,0,0);
          pose('Ponytail1',Math.sin(t*1.4)*.025*reduced,0,Math.sin(t*.65)*.025*reduced);
          const blinkPhase=t%4.6;const blink=blinkPhase<.17?Math.sin(blinkPhase/.17*Math.PI):0;
          const blend=1-Math.exp(-dt*20);expression('eyeBlinkLeft',blink,blend);expression('eyeBlinkRight',blink,blend);
          expression('mouthSmileLeft',.25+welcome*.35+talking*.05,blend);expression('mouthSmileRight',.25+welcome*.35+talking*.05,blend);
          expression('browInnerUp',.04+welcome*.15+listening*.04,blend);
          const word=state.speech?.text.slice(state.speech.charIndex,state.speech.charIndex+Math.max(1,state.speech.charLength)).toLowerCase() ?? '';
          const vowel=word.match(/[aeiou]/g); const letter=vowel?.[Math.floor(t*5)%vowel.length] ?? ['a','e','o','i'][Math.floor(t*4)%4];
          const activeViseme=letter==='o'?'viseme_O':letter==='u'?'viseme_U':letter==='e'?'viseme_E':letter==='i'?'viseme_I':'viseme_aa';
          const articulation=talking*(.18+.45*Math.max(0,Math.sin(t*13.7)))*(.85+.15*Math.sin(t*3.1));
          for(const viseme of visemes)expression(viseme,viseme===activeViseme?articulation:0,blend);
          expression('jawOpen',talking*(.025+.055*Math.max(0,Math.sin(t*13.7))),blend);
          renderer.render(scene,camera);
          renderer.domElement.dataset.motion=state.mode;
        }
        frame=requestAnimationFrame(animate);
      } catch(error) {if(alive){setStatus('error');live.current.onError?.(error instanceof Error?error.message:'Avatar could not load');}}
    }
    void initialize();
    return()=>{alive=false;cancelAnimationFrame(frame);resize?.disconnect();container.removeEventListener('pointermove',onPointer);container.removeEventListener('pointerleave',onLeave);for(const material of materials)material.dispose();for(const geometry of geometries)geometry.dispose();if(renderer){renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
  },[props.tutor,attempt]);
  return <div className="tutor-avatar-render" data-state={status}>
    <div className="tutor-avatar-host" ref={host}/>
    {status==='loading'&&<div className="call-model-loading" role="status"><span className="avatar-load-ring"/><strong>{tr(`${props.tutor} is getting ready…`,`${props.tutor} đang chuẩn bị một chút nhé…`)}</strong></div>}
    {status==='error'&&<div className="call-model-fallback"><img src={`/assets/${props.tutor.toLowerCase()}-body.webp`} alt={props.tutor}/><div className="call-fallback-message"><p>{tr('The 3D view couldn’t load here. Your voice practice still works.','Khung 3D chưa tải được. Mình vẫn có thể luyện nói với nhau nhé.')}</p><button type="button" onClick={()=>setAttempt(n=>n+1)}>{tr('Try the 3D view again','Thử tải lại khung 3D')}</button></div></div>}
  </div>;
}
