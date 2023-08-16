import React, {useEffect, useRef, useState} from 'react';
import {useConnect} from "../../../../api/contracts";
import {
    Pagination,
    Button,
    Modal,
    Select,
    Descriptions,
    message,
    Form,
    List,
    Input,
    notification,
    Card,
    Checkbox
} from 'antd';
import {getContractByName, getContractByContract} from "../../../../api/connectContract";
import {dealMethod, viewMethod} from "../../../../utils/contractUtil"
import {useNavigate, useLocation} from "react-router-dom";
import FireLockStyle from "./style";
import judgeStatus from "../../../../utils/judgeStatus";
import AddWhiteListAddr from "./component/AddAirdropListAddr";
import RemoveWhiteListAddr from "./component/RemoveWhiteListAddr";
import {getWhitelist,getDeleteData,getsSetAmountData} from "../../../../graph/flmAirdrop";
import AddWhiteListAddr2 from "./component/AddSecondAdminAddr";
import addressMap from "../../../../api/addressMap";
import {MaxUint256} from "../../../../config/constants";
import checkIcon from ".././../../../imgs/svg/checkbox-checked.svg"
import checkActiveIcon from ".././../../../imgs/svg/checkbox-checked-active.svg"

import BigNumber from "bignumber.js";
import {showNum} from "../../../../utils/bigNumberUtil";
import TextArea from "antd/es/input/TextArea";

const FireLock = (props) => {
    let {state, dispatch} = useConnect();
    const [total, setTotal] = useState(0)
    const [curPage, setCurPage] = useState(1)
    const [pageCount, setPageCount] = useState(20)
    const [whitelist, setWhitelistArr] = useState([])
    const [flmDecimal, setFLMDecimal] = useState(0)
    const [adminArr, setWAdminArr] = useState([])
    const [isSecAdmin, setISSecAdmin] = useState(true)
    const [isPause, setIsPause] = useState(false)
    const [isModifyMolOpen, setIsModifyMolOpen] = useState(false)
    const [modifyList, setModifyList] = useState([])


    const [curNav, setCurNav] = useState(1)
    const [ownerAddr, setOwner] = useState("")

    const [isAdmin, setIsAdmin] = useState(false)

    const [isSurAdmin, setSuperAdmin] = useState(false)
    const [searchContent, setSearchContent] = useState()
    const [showSearch, setShowSearch] = useState(false)


    const [isShowAdd, setShowAdd] = useState(false)
    const [isShowRemove, setShowRemove] = useState(false)

    const [isShowAddLevel2, setShowAddLevel2] = useState(false)
    const [isCheckAll, setIsCheckAll] = useState(false)
    const [coinInfo, setCoinInfo] = useState({})
    const [poolFLMBalance, setPoolFLMBalance] = useState(0)
    const [coinAddr, setCoinAddr] = useState()
    const [withdrawCoinAddr, setWithdrawCoinAddr] = useState()
    const [isSetAmountOpen, setIsSetAmountOpen] = useState(false)
    const [flmAddr, setFLMAddr] = useState()
    const [form] = Form.useForm();
    const [addressString, setCurAddrString] = useState()
    const [amountString, setAmountString] = useState()
    const [infoString, setInfoString] = useState("")
    const location = useLocation()

    const openNotification = (message) => {
        notification.error({
            message: message,
            description:
                "",
            onClick: () => {
            },
        });
    };
    const handleDealMethod = async (name, params) => {
        let contractTemp = await getContractByName("FLMAirdrop", state.api,)
        if (!contractTemp) {
            openNotification("Please connect")
        }
        return dealMethod(contractTemp, state.account, name, params)
    }
    const handleShowSizeChange = async (page, count) => {
        setPageCount(count)
    }
    const onChangePage = async (page) => {
        await setCurPage(page)
    }

    const handleViewMethod = async (name, params) => {
        let contractTemp = await getContractByName("FLMAirdrop", state.api,)
        if (!contractTemp) {
            openNotification("Please connect")
        }
        return await viewMethod(contractTemp, state.account, name, params)
    }
    const handleDealCoinMethod = async (name, address, params) => {
        let contractTemp = await getContractByContract("erc20", address, state.api,)
        return dealMethod(contractTemp, state.account, name, params)
    }

    const getData = async (page) => {
        getOwner()
        getWList()
        getAdmins()
        getISPause()
        getFLMAddr()
    }


    const getOwner = async () => {
        const ownerAddr = await handleViewMethod("owner", [])
        setOwner(ownerAddr)
        setIsAdmin(ownerAddr.toLowerCase() == state.account.toLowerCase())
    }


    const getTokenBalance = async () => {
        let contractTemp = await getContractByContract("erc20", flmAddr, state.api,)
        const decimal = await viewMethod(contractTemp, state.account, "decimals", [])
        setFLMDecimal(decimal)

        let balance = await viewMethod(contractTemp, state.account, "balanceOf", [addressMap["FLMAirdrop"].address])
        balance = balance / (10 ** parseInt(decimal))
        setPoolFLMBalance(balance)

    }
    const getCoinInfo = async (coinAddr) => {
        if (!state.api.utils.isAddress(coinAddr)) {
            return
        }
        let contractTemp = await getContractByContract("erc20", coinAddr, state.api,)
        const decimal = await viewMethod(contractTemp, state.account, "decimals", [])
        let balance = await viewMethod(contractTemp, state.account, "balanceOf", [addressMap["FLMAirdrop"].address])
        let name =  await viewMethod(contractTemp, state.account, "name", [])

        balance = balance / (10 ** parseInt(decimal))
        setCoinInfo({
            balance,
            name
        })

    }
    const getWList = async () => {
        const record = await getWhitelist()
        const deleteData = await getDeleteData()
        const setAmountData = await getsSetAmountData()

        const res = await handleViewMethod("getAirDropList", [])
        const recordArr = record.data.claimRecords
        let resArr = []
        res.forEach(addr => {
            recordArr.forEach(record => {
                if (record.user.toLowerCase() == addr.toString().toLowerCase()) {
                    resArr.push(record)
                }
            })

        })
        resArr.sort((a,b)=>{
            if(BigNumber(a.Contract_id ).lt(b.Contract_id)){
                return -1
            }
            return 1

        })
        setWhitelistArr(resArr)

        if(deleteData&&deleteData.data&&deleteData.data.decUserAmounts.length>0){
            resArr.forEach(item=>{
                deleteData.data.decUserAmounts.forEach(delItem=>{
                    if(delItem.user.toLowerCase() == item.user.toLowerCase()){
                        item.amount = BigNumber(item.amount).minus(delItem.amount).toString()
                    }
                })
            })
        }
        if(setAmountData&&setAmountData.data&&setAmountData.data.fixEvents.length>0){
            resArr.forEach(item=>{
                deleteData.data.fixEvents.forEach(setItem=>{
                    if(setItem.user.toLowerCase() == item.user.toLowerCase()){
                        item.amount =setItem.amount
                    }
                })
            })
        }

        resArr.forEach(item => {
            item.checked = false
        })
        resArr.sort()
        setIsCheckAll(false)
        setTotal(resArr.length)
    }

    const getAdmins = async () => {
        const res = await handleViewMethod("getAdminsLevelTwoList", [])
        setWAdminArr(res)
        res.forEach(addr => {
            if (addr.toString().toLowerCase() == state.account.toLowerCase()) {
                setISSecAdmin(true)
                setCurNav(3)
            }
        })
    }
    const getFLMAddr = async () => {
        const res = await handleViewMethod("flm", [])
        setFLMAddr(res)
        setCoinAddr(res)
    }
    const getISPause = async () => {
        const res = await handleViewMethod("paused", [])
        setIsPause(res)
    }

    const pause = async () => {
        await handleDealMethod("pause", [])
        getISPause()
    }
    const unPause = async () => {
        await handleDealMethod("unpause", [])
        getISPause()
    }
    const transferOwnership = async () => {
        await handleDealMethod("transferOwnership", [form.getFieldValue().owner])
        getOwner()
    }
    const setFpAddr = async () => {
        await handleDealMethod("setFpAddr", [form.getFieldValue().fpAddr])
        // getOwner()
    }

    const getModifList = async (addr) => {
        let checkArr = []
        whitelist.forEach(item => {
            if (item.checked && checkArr.indexOf(item.user) == -1) {
                checkArr.push(item)
            }
        })
        let addressString="",amountString=""
        checkArr.forEach((item,index)=>{
            if (index == item.length - 1) {
                addressString += item.user
                amountString += item.amount

            } else {
                addressString += item.user  + "\n"
                amountString += item.amount / 10**flmDecimal + "\n"
            }
        })
        setCurAddrString(addressString)
        setAmountString(amountString)
        setModifyList(checkArr)
    }
    const getSingleModifList = async (item) => {
        setCurAddrString(item.user)
        setAmountString(item.amount / 10**flmDecimal)
        setModifyList([item])
    }
    const subAirDropAmount = async (addr) => {
        let _to = [], _amount = []
        _to = addressString.toString().split('\n')
        _amount = amountString.toString().split('\n')
        _to.forEach((address, index) => {
            address = address.trim()
            if (!state.api.utils.isAddress(address)) {
                _to.splice(index, 1)
            }

        })
        for (let i = 0; i < _amount.length; i++) {
            _amount[i] = BigNumber(_amount[i]).multipliedBy(10 ** flmDecimal).toFixed(0).toString()
        }
        if (!(BigNumber(_amount[_amount.length-1])>=0)) {
            _amount.pop()
        }
        console.log({_to,_amount,infoString})
        await handleDealMethod("subAirDropAmount", [_to,_amount,infoString])
        getWList()
    }
    const subAirDropAmountForAdmin1 = async (addr) => {
        let _to = [], _amount = []
        _to = addressString.toString().split('\n')
        _amount = amountString.toString().split('\n')
        _to.forEach((address, index) => {
            address = address.trim()
            if (!state.api.utils.isAddress(address)) {
                _to.splice(index, 1)
            }

        })
        for (let i = 0; i < _amount.length; i++) {
            _amount[i] = BigNumber(_amount[i]).multipliedBy(10 ** flmDecimal).toFixed(0).toString()
        }
        if (!(BigNumber(_amount[_amount.length-1])>=0)) {
            _amount.pop()
        }
        console.log({_to,_amount,infoString})
        await handleDealMethod("setUserAmount", [_to,_amount,infoString])
        getWList()
    }
    const setFlm = async (addr) => {
        await handleDealMethod("setFlm", [form.getFieldValue().flmAddr])
        getFLMAddr()
    }
    const removeAdminsLevelTwo = async (addr) => {
        await handleDealMethod("removeAdminsLevelTwo", [[addr]])
        getAdmins()
    }
    const deposit = async () => {
        let contractTemp = await getContractByContract("erc20", coinAddr, state.api,)
        const decimals = await viewMethod(contractTemp, state.account, "decimals", [])
        await handleDealMethod("deposit", [coinAddr, BigNumber(form.getFieldValue().coinAmount * BigNumber(10).pow(decimals)).toFixed(0).toString()])
        getTokenBalance()
    }
    const backToken = async () => {
        let contractTemp = await getContractByContract("erc20", withdrawCoinAddr, state.api,)
        const decimals = await viewMethod(contractTemp, state.account, "decimals", [])
        await handleDealMethod("backToken", [withdrawCoinAddr, BigNumber(form.getFieldValue().withdrawAmount * BigNumber(10).pow(decimals)).toFixed(0).toString()])
        getTokenBalance()
    }
    const approve = async () => {
        await handleDealCoinMethod("approve", coinAddr, [addressMap["FLMAirdrop"].address, MaxUint256])
    }
    const handleSearch = () => {
        setShowSearch(true)
    }
    useEffect(async () => {
        let judgeRes = await judgeStatus(state)
        if (!judgeRes) {
            return
        }
        await getData()
    }, [state.account]);
    useEffect(async () => {
        if (coinAddr) {
            getTokenBalance()
        }
    }, [coinAddr]);
    const handleCheck = (item, index, val) => {
        const tempArr = [...whitelist]
        item.checked = val
        tempArr[index] = item
        setWhitelistArr(tempArr)
    }
    const handleCheckAll = (val) => {
        const tempArr = [...whitelist]
        tempArr.forEach(item => {
            item.checked = val
        })
        setWhitelistArr(tempArr)
    }
    return (
        <FireLockStyle>
            {isShowAdd && <AddWhiteListAddr updateData={() => {
                setTimeout(() => {
                    getWList()
                }, 3000)
            }} closeDialog={() => {
                setShowAdd(false)
            }}/>}

            {isShowAddLevel2 && <AddWhiteListAddr2 updateData={() => {
                getAdmins()
            }} closeDialog={() => {
                setShowAddLevel2(false)
            }}/>}
            {isShowRemove && <RemoveWhiteListAddr updateData={() => {
                getAdmins()
            }} closeDialog={() => {
                setShowRemove(false)
            }}/>}
            {ownerAddr && (isSurAdmin||isAdmin || isSecAdmin) && <div>
                <h1 className="title">
                    FLM Airdrop Manage
                </h1>
                <div className="panel-box">
                    <Modal className="model-dialog" title="Modify List" open={isModifyMolOpen} onOk={subAirDropAmount}
                           onCancel={() => {
                               setIsModifyMolOpen(false)
                           }}>
                        <div className="del-content">
                            <Form form={form} name="control-hooks">
                                <Form.Item
                                    name="address"
                                    label="Wallet Address"
                                    className="address-box"
                                >
                                    <div className="flex-box">
                                        <TextArea placeholder="one address perline" rows={10} value={addressString}
                                                  onChange={(e) => {
                                                      setCurAddrString(e.target.value)
                                                  }}/>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    name="amount"
                                    label="Amount"
                                    className="number-box"
                                >
                                    <div className="flex-box">
                                        <TextArea placeholder="one amount perline" rows={10} value={amountString}
                                                  onChange={(e) => {
                                                      setAmountString(e.target.value)
                                                  }}/>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    name="info"
                                    label="Info"
                                >
                                    <div className="flex-box">
                                        <TextArea value={infoString} onChange={(e) => {
                                            setInfoString(e.target.value)
                                        }}/>
                                    </div>
                                </Form.Item>
                            </Form>

                        </div>
                    </Modal>
                    <Modal className="model-dialog" title="Set Can Claim Amount List" open={isSetAmountOpen} onOk={subAirDropAmountForAdmin1}
                           onCancel={() => {
                               setIsSetAmountOpen(false)
                           }}>
                        <div className="del-content">
                            <Form form={form} name="control-hooks">
                                <Form.Item
                                    name="address"
                                    label="Wallet Address"
                                    className="address-box"
                                >
                                    <div className="flex-box">
                                        <TextArea placeholder="one address perline" rows={10} value={addressString}
                                                  onChange={(e) => {
                                                      setCurAddrString(e.target.value)
                                                  }}/>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    name="amount"
                                    label="Amount (Enter the amount you want to change to)"
                                    className="number-box"
                                >
                                    <div className="flex-box">
                                        <TextArea placeholder="one amount perline" rows={10} value={amountString}
                                                  onChange={(e) => {
                                                      setAmountString(e.target.value)
                                                  }}/>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    name="info"
                                    label="Info"
                                >
                                    <div className="flex-box">
                                        <TextArea value={infoString} onChange={(e) => {
                                            setInfoString(e.target.value)
                                        }}/>
                                    </div>
                                </Form.Item>
                            </Form>
                        </div>
                    </Modal>
                    <div className="panel-container">
                        <div className="nav-list">
                            {
                                (isSurAdmin||isAdmin)&&( <div className="nav-list">
                                    <div className={"nav-item " + (curNav == 1 ? "active" : "")} onClick={() => {
                                        setCurNav(1)
                                    }}>
                                        Owner
                                    </div>
                                    <div className={"nav-item " + (curNav == 3 ? "active" : "")} onClick={() => {
                                        setCurNav(3)
                                    }}>
                                        Set Admin Level2
                                    </div>
                                </div>)
                            }

                            <div className="nav-list">
                                <div className={"nav-item " + (curNav == 2 ? "active" : "")} onClick={() => {
                                    setCurNav(2)
                                }}>
                                    Set Airdrop List
                                </div>
                            </div>


                        </div>
                        {curNav == 1 && <div className="part1">
                            <div className="content-item">
                                <h2>Owner Address</h2>
                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Current:
                                        </div>
                                        <div className="value">
                                            {ownerAddr}
                                        </div>
                                    </div>
                                    <Form.Item
                                        name="owner"
                                        label="owner address"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input owner Address!'},
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Form>
                                <Button type="primary" className="max-btn" onClick={() => {
                                    transferOwnership()
                                }}>
                                    Submit
                                </Button>
                            </div>
                            <div className="content-item">
                                <h2>Pause</h2>
                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Current:
                                        </div>
                                        <div className="value">
                                            {isPause ? "Paused" : "UnPaused"}
                                        </div>
                                    </div>

                                </Form>
                                {!isPause && <Button type="primary" className="max-btn" onClick={() => {
                                    pause()
                                }}>
                                    Pause
                                </Button>}
                                {isPause && <Button type="primary" className="max-btn" onClick={() => {
                                    unPause()
                                }}>
                                    unPause
                                </Button>}
                            </div>
                            <div className="content-item">
                                <h2>Coin Deposit</h2>

                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Pool FLM Balance:
                                        </div>
                                        <div className="value">
                                            {showNum(poolFLMBalance)}
                                        </div>
                                    </div>
                                    <Form.Item
                                        name="coinAddr"
                                        label="Coin Address"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input coin Address!'},
                                        ]}
                                    >
                                        <Input value={coinAddr} defaultValue={coinAddr} onChange={(e) => {
                                            setCoinAddr(e.target.value)
                                        }}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="coinAmount"
                                        label="Amount"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input coin Amount!'},
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Form>
                                <Button type="primary" className="max-btn" onClick={() => {
                                    approve()
                                }}>
                                    Approve
                                </Button>
                                <Button type="primary" className="max-btn" onClick={() => {
                                    deposit()
                                }}>
                                    Deposit
                                </Button>
                            </div>
                            <div className="content-item">
                                <h2>Coin Withdraw</h2>

                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Pool {coinInfo.name} Balance:
                                        </div>
                                        <div className="value">
                                            {showNum(coinInfo.balance)}
                                        </div>
                                    </div>
                                    <Form.Item
                                        name="withdrawCoinAddr"
                                        label="Coin Address"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input coin Address!'},
                                        ]}
                                    >
                                        <Input value={withdrawCoinAddr} onChange={(e) => {
                                            setWithdrawCoinAddr(e.target.value)
                                            getCoinInfo(e.target.value)
                                        }}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="withdrawAmount"
                                        label="Amount"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input coin Amount!'},
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Form>

                                <Button type="primary" className="max-btn" onClick={() => {
                                    backToken()
                                }}>
                                    Withdraw
                                </Button>
                            </div>
                            <div className="content-item">
                                <h3>setFpAddr</h3>
                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Current:
                                        </div>
                                        <div className="value">

                                        </div>
                                    </div>
                                    <Form.Item
                                        name="fpAddr"
                                        label="fp address"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input fp Address!'},
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Form>
                                <Button type="primary" className="max-btn" onClick={() => {
                                    setFpAddr()
                                }}>
                                    Submit
                                </Button>
                            </div>
                            <div className="content-item">
                                <h3>Set FLM address</h3>
                                <Form form={form} name="control-hooks">
                                    <div className="current">
                                        <div className="name">
                                            Current:
                                        </div>
                                        <div className="value">
                                            {flmAddr}
                                        </div>
                                    </div>
                                    <Form.Item
                                        name="flmAddr"
                                        label="flm address"
                                        validateTrigger="onBlur"
                                        validateFirst={true}
                                        rules={[
                                            {required: true, message: 'Please input fpAddr Address!'},
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Form>
                                <Button type="primary" className="max-btn" onClick={() => {
                                    setFlm()
                                }}>
                                    Submit
                                </Button>
                            </div>
                        </div>}

                    </div>
                    {curNav == 2 && <div className="panel-container">
                        <div className="panel-title">
                            Set Airdrop List
                            <div className="search-box">
                                <Input value={searchContent} onChange={(e) => {
                                    setSearchContent(e.target.value)
                                    if (!e.target.value) setShowSearch(false)
                                }} allowClear/>
                                <Button className="btn" type="primary" onClick={() => {
                                    handleSearch()
                                }}>Search</Button>
                            </div>
                            <div className="btn-box">

                                <Button className="btn" type="primary" onClick={() => {
                                    setShowAdd(true)
                                }}>Add</Button>
                            </div>
                        </div>

                        <div className="fire-list-box fire-list-box-airdrop">
                            <div className="list-header">
                                <div className="col">
                                    No.
                                </div>

                                <div className="col">
                                    Address
                                </div>
                                <div className="col">
                                    Amount
                                </div>
                                <div className="col">
                                    Modify
                                    <div className="remove-check">
                                        {!isCheckAll && <img className="check-icon" onClick={() => {
                                            setIsCheckAll(true);
                                            handleCheckAll(true)
                                        }} src={checkIcon} alt=""/>}
                                        {isCheckAll && <img className="check-icon" onClick={() => {
                                            setIsCheckAll(false);
                                            handleCheckAll(false)
                                        }} src={checkActiveIcon} alt=""/>}

                                        <Button onClick={() => {
                                            setIsModifyMolOpen(true)
                                            getModifList()
                                        }}>Modify</Button>
                                    </div>
                                </div>

                            </div>
                            {!showSearch && curPage && whitelist.map((item, index) => {
                                if (index >= pageCount * (curPage - 1) && index < pageCount * curPage) {
                                    return (<div className="list-item" key={index}>
                                        <div className="col">
                                            {index + 1}
                                        </div>
                                        <div className="col">
                                            {item.user}
                                        </div>
                                        <div className="col">
                                            {showNum(item.amount / 10 ** 18)}
                                        </div>
                                        <div className="col">
                                            {/*<Checkbox value={item.checked} onChange={(e) => {*/}
                                            {/*    handleCheck(item, index, e)*/}
                                            {/*}}>*/}
                                            {/*</Checkbox>*/}
                                            {!item.checked && <img className="check-icon" onClick={() => {
                                                handleCheck(item, index, true)
                                            }} src={checkIcon} alt=""/>}
                                            {item.checked && <img className="check-icon" onClick={() => {
                                                handleCheck(item, index, false)
                                            }} src={checkActiveIcon} alt=""/>}
                                            <Button className="remove-btn" onClick={() => {
                                                // removeWhiteList(item.user)
                                                setIsModifyMolOpen(true)
                                                getSingleModifList(item)
                                            }}>Modify</Button>
                                        </div>
                                    </div>)
                                }

                            })}
                            {showSearch && whitelist.map((item, index) => {
                                if (item.user.toLowerCase() == searchContent.toString().toLowerCase()) {
                                    return (<div className="list-item" key={index}>
                                        <div className="col">
                                            {index + 1}
                                        </div>

                                        <div className="col">
                                            {item.user}
                                        </div>
                                        <div className="col">
                                            {showNum(item.amount / 10 ** 18)}
                                        </div>
                                        <div className="col">
                                            <Button onClick={() => {
                                                // removeWhiteList(item.user)
                                                setIsModifyMolOpen(true)
                                                getSingleModifList(item)
                                            }}>Modify</Button>
                                        </div>
                                    </div>)
                                }

                            })}

                        </div>
                        <div className="pagination">
                            {
                                <Pagination current={curPage} showSizeChanger
                                            onShowSizeChange={handleShowSizeChange}
                                            onChange={onChangePage} total={total}
                                            defaultPageSize={pageCount}/>
                            }
                        </div>
                    </div>}
                    {curNav == 3 && <div className="panel-box">
                        <div className="panel-container">
                            <div className="panel-title">
                                Set Admin Level2
                                <div className="btn-box">
                                    <Button className="btn" type="primary" onClick={() => {
                                        setShowAddLevel2(true)
                                    }}>Add</Button>
                                    <Button className="btn" type="primary" onClick={() => {
                                        setShowRemove(true)
                                    }}>Remove</Button>
                                </div>
                            </div>
                            <div className="fire-list-box fire-list-box-admin">
                                <div className="list-header">
                                    <div className="col">
                                        No.
                                    </div>
                                    <div className="col">
                                        Address
                                    </div>
                                    <div className="col">
                                        Delete
                                    </div>

                                </div>
                                {adminArr.map((item, index) => {
                                    return (<div className="list-item list-item-admin" key={index}>
                                        <div className="col">
                                            {index + 1}
                                        </div>

                                        <div className="col">
                                            {item}
                                        </div>
                                        <div className="col">
                                            <div className="col">
                                                <Button onClick={() => {
                                                    removeAdminsLevelTwo(item)
                                                }}>Delete</Button>
                                            </div>
                                        </div>
                                    </div>)
                                })}
                            </div>
                        </div>

                        <div className="panel-container">
                            <div className="panel-title">
                                Set Airdrop User Amount
                                <div className="search-box">
                                    <Input value={searchContent} onChange={(e) => {
                                        setSearchContent(e.target.value)
                                        if (!e.target.value) setShowSearch(false)
                                    }} allowClear/>
                                    <Button className="btn" type="primary" onClick={() => {
                                        handleSearch()
                                    }}>Search</Button>
                                </div>
                            </div>

                            <div className="fire-list-box fire-list-box-airdrop">
                                <div className="list-header">
                                    <div className="col">
                                        No.
                                    </div>

                                    <div className="col">
                                        Address
                                    </div>
                                    <div className="col">
                                        Amount
                                    </div>
                                    <div className="col">
                                        Set Amount
                                    </div>

                                </div>
                                {!showSearch && curPage && whitelist.map((item, index) => {
                                    if (index >= pageCount * (curPage - 1) && index < pageCount * curPage) {
                                        return (<div className="list-item" key={index}>
                                            <div className="col">
                                                {index + 1}
                                            </div>
                                            <div className="col">
                                                {item.user}
                                            </div>
                                            <div className="col">
                                                {showNum(item.amount / 10 ** flmDecimal)}
                                            </div>
                                            <div className="col">
                                                {!item.checked && <img className="check-icon" onClick={() => {
                                                    handleCheck(item, index, true)
                                                }} src={checkIcon} alt=""/>}
                                                {item.checked && <img className="check-icon" onClick={() => {
                                                    handleCheck(item, index, false)
                                                }} src={checkActiveIcon} alt=""/>}
                                                <Button className="remove-btn" onClick={() => {
                                                    // removeWhiteList(item.user)
                                                    setIsSetAmountOpen(true)
                                                    getSingleModifList(item)
                                                }}>Set Amount</Button>
                                            </div>
                                        </div>)
                                    }

                                })}
                                {showSearch && whitelist.map((item, index) => {
                                    if (item.user.toLowerCase() == searchContent.toString().toLowerCase()) {
                                        return (<div className="list-item" key={index}>
                                            <div className="col">
                                                {index + 1}
                                            </div>
                                            <div className="col">
                                                {item.user}
                                            </div>
                                            <div className="col">
                                                {showNum(item.amount / 10 ** flmDecimal)}
                                            </div>
                                            <div className="col">
                                                <Button onClick={() => {
                                                    // removeWhiteList(item.user)
                                                    setIsSetAmountOpen(true)
                                                    getSingleModifList(item)
                                                }}>Set Amount</Button>
                                            </div>
                                        </div>)
                                    }
                                })}

                            </div>
                            <div className="pagination">
                                {
                                    <Pagination current={curPage} showSizeChanger
                                                onShowSizeChange={handleShowSizeChange}
                                                onChange={onChangePage} total={total}
                                                defaultPageSize={pageCount}/>
                                }
                            </div>
                        </div>

                    </div>}
                </div>
            </div>}

        </FireLockStyle>
    )
}
export default FireLock
