exports.getAllEvents = (req, res) => {
  res.status(200).json({ success: true, data: upcomingEvents });
};

exports.createEvent = (req, res) => {
  const { title, date, location } = req.body;
  if (!title || !date) {
    return res
      .status(400)
      .json({ success: false, message: "Title and date are required" });
  }

  const newEvent = { id: Date.now(), title, date, location };
  upcomingEvents.push(newEvent);

  res.status(201).json({ success: true, data: newEvent });
};
