import React from 'react'

function AlbumItem({image, name, desc, id}) {
  return (
    <div className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
      <img src={image} alt='image'/>
    </div>
  )
}

export default AlbumItem