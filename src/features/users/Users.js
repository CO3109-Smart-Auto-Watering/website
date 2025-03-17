import React from 'react'
import NavBar from '../../components/layout/NavBar'
import UserTable from './UserTable';
import styled from 'styled-components';
import trendUp from '../../assets/images/trend_up.svg'
import trendDown from '../../assets/images/trend_down.svg'


const MainContent = styled.div`
  margin-left: 260px;
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`;

const UserList = () => {
    return (
        <div className='bg-[#f8f9fc] h-screen'>

            <NavBar />
            <MainContent>
                
                <div className='flex mt-[0px] mb-[24px]'>
                    <div className='relative p-[16px] mr-[32px] bg-white w-[250px] h-[140px] [box-shadow:0px_4px_12px_rgba(0,_0,_0,_0.05)] rounded-[14px]'>
                        <div className='flex'>
                            <div>
                                <h2 className='text-[16px] text-[#636466]'>Total Customers</h2>
                                <h3 className='text-[28px] font-semibold'>500</h3>
                            </div>
                            {/* <Image className='absolute right-[16px]'
                                src={pageBalance} alt='pageBalance' width={50}></Image> */}
                        </div>
                        <div className='flex absolute bottom-[16px]'>
                            <img className='mr-[4px]' src={trendUp} alt='trendUp'></img>
                            <span className='text-[14px] text-[#636466]'>
                                <span className='text-[#00B69B]'>+15 </span>
                                from last week</span>
                        </div>
                    </div>
                    <div className='relative p-[16px] mr-[32px] bg-white w-[250px] h-[140px] [box-shadow:0px_4px_12px_rgba(0,_0,_0,_0.05)] rounded-[14px]'>
                        <div className='flex'>
                            <div>
                                <h2 className='text-[16px] text-[#636466]'>Total</h2>
                                {/* <h3 className='text-[28px] font-semibold'>{totalPrinted}</h3> */}
                            </div>
                            {/* <Image className='absolute right-[16px]'
                                src={pagePrinted} alt='pageBalance' width={50}></Image> */}
                        </div>
                        <div className='flex absolute bottom-[16px]'>
                            <img className='mr-[4px]' src={trendDown} alt='trendDown'></img>
                            <span className='text-[14px] text-[#636466]'>
                                <span className='text-[#F93C65]'>4,3% </span>
                                down from yesterday</span>
                        </div>
                    </div>
                </div>
                
                <UserTable />

            </MainContent>
        </div>
    );
};

export default UserList
