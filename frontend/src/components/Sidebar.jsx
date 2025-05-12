import {assets} from '../assets/frontend-assets/assets'
import { useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
    
    const navigate = useNavigate();
    const location = useLocation();
    if(location.pathname === '/add-song'){
        return null;
    }
  return (
    <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
        <div className='bg-[#121212] h-[15%] rounded flex flex-col justify-around'>
            <div onClick={()=>navigate('/')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                <img src={assets.home_icon} className='w-6'/>
                <p className='font-bold'>Home</p>
            </div>
            <div className='flex items-center gap-3 pl-8 cursor-pointer'>
                <img src={assets.search_icon} className='w-6'/>
                <p className='font-bold'>Search</p>
            </div>
        </div>
        <div className='bg-[#121212] h-[85%] rounded'>
            <div className='p-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <img src={assets.stack_icon} alt='stack' className='w-8'/>
                    <p className='font-semibold'>Your Library</p>
                </div>
                <div className='flex items-center gap-3'>
                    <img src={assets.arrow_icon} alt='arrow' className='w-5'/>
                    <img src={assets.plus_icon} alt='plus' className='w-5'/>
                </div>
            </div>
            <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                <h1>Create Your First Playlist</h1>
                <p className='font-light'>it's easy, we'll help you</p>
                <button className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Create Playlist</button>
            </div>
            <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                <h1>Upload A New Song</h1>
                <p className='font-light'>Make Yourself A Part Of VibeStream Community</p>
                <button onClick={()=>navigate('/add-song')} className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 cursor-pointer'>Continue</button>
            </div>
        </div>
    </div>
  )
}

export default Sidebar;