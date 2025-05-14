import React , {useState,useEffect} from 'react';
import { Tabs } from 'antd';
import axios from'axios'
import Loader from '../Components/Loader';
import Error from '../Components/Error';
import Swal from 'sweetalert2';

//Bookings list components
function Bookings() {
  const [bookings , setBookings]=useState([]);
  const [loading , setLoading]=useState(true);
  const [error , setError]=useState(null)
   useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/bookings/getallbookings");
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  return (
    <div className='row'>
      <div className="col-md-12">
        <h1>Bookings</h1>
        {loading && (<Loader/>)}
        <table className='table table-bordered table-dark'>
          <thead className='bs' >
            <tr>
          <th>Booking Id</th>
          <th>User Id</th>
          <th>Room</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
          </tr>
          </thead>
          <tbody>
              {bookings.length > 0 && bookings.map((bookings) =>{
                return <tr key={bookings._id}>
                  <td>{bookings._id}</td>
                  <td>{bookings.userid}</td>
                  <td>{bookings.room}</td>
                  <td>{bookings.fromdate}</td>
                  <td>{bookings.todate}</td>
                  <td>{bookings.status}</td>

                </tr>
              })}
          </tbody>
        </table>
      
      </div>
    </div>
  );
}

//Rooms list components

function Rooms() {
  const [rooms , setRooms]=useState([]);
  const [loading , setLoading]=useState(true);
  const [error , setError]=useState(null)
   useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("/api/rooms/getallrooms");
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);
  return (
    <div className='row'>
      <div className="col-md-12">
        <h1>Rooms</h1>
        {loading && (<Loader/>)}
        {error && <Error />}
        {!loading && rooms.length > 0 && (
          <table className='table table-bordered table-dark'>
            <thead className='bs'>
              <tr>
                <th>Room Id</th>
                <th>Name</th>
                <th>Type</th>
                <th>Rent Per Day</th>
                <th>Max Count</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room._id}</td>
                  <td>{room.name}</td>
                  <td>{room.type}</td>
                  <td>{room.rentperday}</td>
                  <td>{room.maxcount}</td>
                  <td>{room.phonenumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && rooms.length === 0 && (
          <p>No rooms found.</p>
        )}
      </div>
    </div>
  );
}

//Users list components
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/getallusers");
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className='row'>
      <div className='col-md-12'>
        <h1>Users</h1>

        {loading && <Loader />}
        {error && <Error />}
        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <table className='table table-bordered table-dark'>
            <thead className='bs'>
              <tr>
                <th>User Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Is Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

//Add Room components



function AddRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const[name , setName]=useState('');
  const[rentperday , setRentperday]=useState();
  const[maxcount , setMaxcxount]=useState();
  const[description , setDescription]=useState();
  const[phonenumber , setPhonenumber]=useState();
  const[type , setType]=useState();
  const[imageurl1 , setImageurl1]=useState();
   const[imageurl2 , setImageurl2]=useState();
    const[imageurl3 , setImageurl3]=useState();

    async function addRoom() {

      const newroom={
        name,
        rentperday,
        maxcount,
        description,
        phonenumber,
        type,
        imageurls:{imageurl1 , imageurl2 ,imageurl3}
      }
console.log(newroom)

try{
  setLoading(true)
  const result=await (axios.post("/api/rooms/addroom", newroom)).data
  console.log(result);
  setLoading(false)
  Swal.fire('Congrats', "Your new room added successfully" , 'success').then(result=> {
    window.location.href="/home"
  })
}
catch(error){
  console.log(error)
  setLoading(false)
  Swal.fire('Oops' , 'Something went wrong' , 'error')
}
    }
  
  return (
    <div className='row'>
      <div className='col-md-5'>
        {loading && <Loader/>}
<input type="text" className='form-control' placeholder='room name' value={name} onChange={(e)=>{setName(e.target.value)}} />
<input type="text" className='form-control' placeholder='rent per day' value={rentperday} onChange={(e)=>{setRentperday(e.target.value)}}/>
<input type="text" className='form-control' placeholder='max count' value={maxcount} onChange={(e)=>{setMaxcxount(e.target.value)}}/>
<input type="text" className='form-control' placeholder='description' value={description} onChange={(e)=> {setDescription(e.target.value)}}/>
<input type="text" className='form-control' placeholder='phone number' value={phonenumber} onChange={(e)=> {setPhonenumber(e.target.value)}}/>
      </div>

      <div className='co-md-5'>
<input type="text" className='form-control' placeholder='type' value={type} onChange={(e)=> {setType(e.target.value)}}/>
<input type="text" className='form-control' placeholder='Image Url 1' value={imageurl1} onChange={(e)=> {setImageurl1(e.target.value)}}/>
<input type="text" className='form-control' placeholder='Image Url 2'  value={imageurl2} onChange={(e)=> {setImageurl2(e.target.value)}} />

<input type="text" className='form-control' placeholder='Image Url 3'  value={imageurl3} onChange={(e)=> {setImageurl3(e.target.value)}}/>

<div className='text-right'>
  <button className='btn btn-primary mt-2' onClick={addRoom}>Add Room</button>
</div>
      </div>
    </div>
  )
}


function Adminscreen() {

  useEffect(() =>{
    if(!JSON.parse(localStorage.getItem("currentUser")).isAdmin){
      window.location.href="/home"
    }
  }, [])
  const items = [
    {
      key: '1',
      label: 'Bookings',
      children: <Bookings />,
    },
    {
      key: '2',
      label: 'Rooms',
      children: <Rooms/>, // Replace with <Rooms /> once created
    },
    {
      key: '3',
      label: 'Add Room',
      children: <AddRoom/>, // Replace with <AddRoom /> once created
    },
    {
      key: '4',
      label: 'Users',
      children: <Users/>, // Replace with <Users /> once created
    },
  ];

  return (
    <div className="mt-3 ml-3 bs">
      <h2 className="text-center mb-4">Admin Panel</h2>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

export default Adminscreen;