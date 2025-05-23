using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlumniAPI.Models
{
    public class Employment
    {
        public int Id { get; set; }
        public string Organization { get; set; }
        public string OrganizationSite { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string JobType { get; set; }
        public string JobDescription { get; set; }
        public string RelatedField { get; set; }

        public virtual Address Address { get; set; }

        public int GraduateId { get; set; }
        public virtual Graduate? Graduate { get; set; }

        public Employment()
        {
            Address = new Address();
        }
    }

}
