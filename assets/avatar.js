import {esc} from './icons.js?v=20261027-web-r3';
export function userAvatar(className='',alt=''){
 return '<img class="user-avatar '+esc(className)+'" src="assets/default-avatar-robot.png" alt="'+esc(alt)+'" width="40" height="40" decoding="async">';
}
