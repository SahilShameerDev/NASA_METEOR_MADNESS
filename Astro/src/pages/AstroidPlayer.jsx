import React from 'react'
import Globe from '../components/Globe'

const AstroidPlayer = () => {
  return (
    <div className='w-full h-screen p-16'>
      <h1 className='text-3xl font-medium'>Astro <span className='font-extralight'>Meteoroid Detection</span> </h1>
      <div className='flex w-full h-[500px] bg-black p-8 mt-16 overflow-hidden rounded-lg text-white'>
        <div className='w-1/2 h-full '>
          <div className='h-full overflow-y-scroll pr-4 '>
            <h2 className='text-3xl font-medium mb-8'>Earth </h2>
            <p className='mb-4'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>

        </div>
        <div className='h-[600px] w-1/2'>
          <Globe />
        </div>
      </div>
    </div>
  )
}

export default AstroidPlayer