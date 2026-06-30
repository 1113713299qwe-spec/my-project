export const SUPPORTED_IMAGE_TYPES=['image/png','image/jpeg','image/webp'];
export const MAX_IMAGE_BYTES=7*1024*1024;
export function fileToDataUrl(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)})}
export function validateDataUrlImage(dataUrl:string){if(!dataUrl.startsWith('data:image/'))return '图片必须是 data URL';const mime=dataUrl.slice(5,dataUrl.indexOf(';'));if(!SUPPORTED_IMAGE_TYPES.includes(mime))return '仅支持 png、jpg/jpeg、webp';const approx=(dataUrl.length*3)/4;if(approx>MAX_IMAGE_BYTES)return '单张图片不能超过 7MB';return null}
