export function subscribeLoad(e,t){return t?t.aborted?(e.catch(()=>{}),Promise.reject(t.reason)):new Promise((n,r)=>{let abort=()=>r(t.reason);t.addEventListener(`abort`,abort,{once:!0}),e.then(e=>{t.removeEventListener(`abort`,abort),t.aborted?r(t.reason):n(e)},e=>{t.removeEventListener(`abort`,abort),r(e)})}):e}
//# sourceMappingURL=subscribe-load.js.map
