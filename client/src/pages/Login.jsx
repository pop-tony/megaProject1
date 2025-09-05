import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

  const navigate = useNavigate()

  const {backendUrl, setIsLoggedin, getUserData,} = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e)=>{
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      if(state === 'Sign Up'){
        //axios.defaults.withCredentials = true;
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})

        if(data.success){
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }else{
        //axios.defaults.withCredentials = true;
        const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})

        if(data.success){
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=> navigate('/')} src={assets.logo} alt="" className='absolute left-5 w-25 sm:w-38 sm:left-20 top-5 cursor-pointer'/>

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{ state === 'Sign Up' ? 'Register' : 'Sign In'}</h2>

        <p className='text-center text-sm mb-6'>{ state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.profile} alt="" className='w-8 h-10 sm:w-5'/>
            <input onChange={e => setName(e.target.value)} className='outline-none' type='text' placeholder='Full Name' value={name} required />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.email} alt="" className='w-8 h-10 sm:w-5'/>
            <input onChange={e => setEmail(e.target.value)} className='outline-none' type='email' placeholder='Email Id' value={email} required />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock} alt="" className='w-8 h-10 sm:w-5'/>
            <input onChange={e => setPassword(e.target.value)} className='outline-none' type='password' placeholder='Password' value={password} required />
          </div>

          {state === 'Login' && (<p onClick={()=> navigate('/reset-password')} className='text-indigo-500 mb-4 cursor-pointer'>Forgot Password?</p>)}
  
          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer hover:bg-violet-300 transition-all'>{ state}</button>
        </form>
        
        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>Already Have Account? {' '} 
            <span onClick={()=> setState('Login')} className='text-blue-400 cursor-pointer underline'>Login</span>
          </p>) : ( 
          <p className='text-gray-400 text-center text-xs mt-4'>Don't Have an Account? {' '} 
            <span onClick={()=> setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign Up</span>
          </p>) 
        }

      </div>
    </div>
  )
}

export default Login
