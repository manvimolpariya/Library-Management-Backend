class BookDTO{
    constructor(user){
        this._id = user._id;
        this.Image = user.Image;
        this.Title = user.Title;
        this.Authore = user.Authore;
        this.Gengre = user.Gengre;
        this.PublicationYear =  user.PublicationYear;
        this.TotalCopies = user.TotalCopies;
        this.AvailableCopies = user.AvailableCopies
    }
}

export default BookDTO;
