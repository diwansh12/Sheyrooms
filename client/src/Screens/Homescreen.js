import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Room from '../Components/Room';
import Loader from '../Components/Loader';
import Error from '../Components/Error';
import { DatePicker } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

function Homescreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(false);
  const [fromdate, setfromdate] = useState();
  const [todate, settodate] = useState();
  const [duplicaterooms, setduplicaterooms] = useState([]);
  const [searchkey, setSearchkey] = useState('');
  const [roomType, setRoomType] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem('currentUser')) {
      window.location.href = '/login';
    }

    const fetchRooms = async () => {
      try {
        setloading(true);
        const { data } = await axios.get('/api/rooms/getallrooms');
        setRooms(data);
        setduplicaterooms(data);
        setloading(false);
      } catch (error) {
        seterror(true);
        setloading(false);
      }
    };

    fetchRooms();
  }, []);

  function filterByDate(dates) {
    if (!dates || dates.length !== 2) return;

    const fromISO = dates[0].format('YYYY-MM-DD');
    const toISO = dates[1].format('YYYY-MM-DD');

    setfromdate(dates[0].format('DD-MM-YYYY'));
    settodate(dates[1].format('DD-MM-YYYY'));

    const from = moment(fromISO);
    const to = moment(toISO);

    const temprooms = duplicaterooms.filter(room => {
      let available = true;
      for (const booking of room.currentbookings || []) {
        const bookingFrom = moment(booking.fromdate, 'YYYY-MM-DD');
        const bookingTo = moment(booking.todate, 'YYYY-MM-DD');

        if (
          from.isBetween(bookingFrom, bookingTo, null, '[]') ||
          to.isBetween(bookingFrom, bookingTo, null, '[]') ||
          bookingFrom.isBetween(from, to, null, '[]') ||
          bookingTo.isBetween(from, to, null, '[]')
        ) {
          available = false;
          break;
        }
      }
      return available;
    });

    setRooms(temprooms);
  }

  function filterBySearch() {
    const filtered = duplicaterooms.filter(room =>
      room.name.toLowerCase().includes(searchkey.toLowerCase())
    );
    setRooms(filtered);
  }

  function filterByType(type) {
    setRoomType(type);
    if (type === "all") {
      setRooms(duplicaterooms);
    } else {
      const filtered = duplicaterooms.filter(
        room => room.type.toLowerCase() === type.toLowerCase()
      );
      setRooms(filtered);
    }
  }

  useEffect(() => {
    filterBySearch();
  }, [searchkey]);

  return (
    <div className="container mt-5">

      {/* Filters Section */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <RangePicker format="DD-MM-YYYY" onChange={filterByDate} className="w-100" />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search rooms"
              value={searchkey}
              onChange={(e) => setSearchkey(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={roomType}
              onChange={(e) => filterByType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="delux">Delux</option>
              <option value="non-delux">Non-Delux</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row justify-content-center">
        {loading ? (
          <div className="text-center mt-5">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center mt-5">
            <Error message="Something went wrong. Please try again." />
          </div>
        ) : rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="col-md-9 mt-3" key={room._id}>
              <Room room={room} fromdate={fromdate} todate={todate} />
            </div>
          ))
        ) : (
          <div className="text-center mt-5">
            <h5 className="text-muted">No rooms available for the selected criteria.</h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homescreen;
