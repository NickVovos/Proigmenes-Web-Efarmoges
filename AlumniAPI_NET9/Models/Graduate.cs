using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace AlumniAPI.Models
{
    public class Graduate
    {
        public int Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public int AcademicEntryYear { get; set; }
        public DateTime GraduationDate { get; set; }
        public double DegreeGrade { get; set; }

        public string Email { get; set; }
        public string PersonalWebsite { get; set; }

        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public virtual ICollection<Phone> Phones { get; set; }
        public virtual ICollection<SocialMedia> SocialMedias { get; set; }
        public virtual ICollection<Employment> Employments { get; set; }

        public Graduate()
        {
            Phones = new List<Phone>();
            SocialMedias = new List<SocialMedia>();
            Employments = new List<Employment>();
        }
    }

}
